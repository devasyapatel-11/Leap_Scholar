import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdaptivePacingEngine, AdaptiveGoal, UserPerformance, PacingMode, SkillFocus } from '@/lib/adaptivePacing';

export interface AdaptiveDailyGoal extends AdaptiveGoal {
  id: string;
  userId: string;
  goalDate: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  timeSpentMinutes?: number;
}

export interface UseAdaptiveDailyGoalsReturn {
  todayGoal: AdaptiveDailyGoal | null;
  upcomingGoals: AdaptiveDailyGoal[];
  completedGoals: AdaptiveDailyGoal[];
  loading: boolean;
  generateTodayGoal: () => Promise<void>;
  completeGoal: (goalId: string, score: number, timeSpent: number) => Promise<void>;
  generateRecoverySession: (missedDays: number) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

export const useAdaptiveDailyGoals = (): UseAdaptiveDailyGoalsReturn => {
  const { user } = useAuth();
  const [todayGoal, setTodayGoal] = useState<AdaptiveDailyGoal | null>(null);
  const [upcomingGoals, setUpcomingGoals] = useState<AdaptiveDailyGoal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<AdaptiveDailyGoal[]>([]);
  const [loading, setLoading] = useState(true);

  const getUserPerformance = async (): Promise<UserPerformance> => {
    if (!user) throw new Error('User not authenticated');

    // Get user progress
    const { data: progress } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .single();

    // Get recent goal completions using existing schema
    const { data: completions } = await supabase
      .from('goal_completions')
      .select('score, time_spent_minutes, completed_at, goal_id')
      .eq('user_id', user.id)
      .order('completed_at', { ascending: false })
      .limit(20);

    // Get daily goals for skill focus analysis using existing schema
    const goalIds = completions?.map(c => c.goal_id) || [];
    const { data: dailyGoalsData } = goalIds.length > 0 ? await supabase
      .from('daily_goals')
      .select('skill_focus')
      .in('id', goalIds) : { data: [] };

    const skillLevels: Record<SkillFocus, number> = {
      listening: progress?.listening_level || 50,
      reading: progress?.reading_level || 50,
      writing: progress?.writing_level || 50,
      speaking: progress?.speaking_level || 50,
      mixed: 50
    };

    const recentScores = (completions || [])
      .filter((comp, index) => comp.score && dailyGoalsData?.[index])
      .map((comp, index) => ({
        skillFocus: (dailyGoalsData?.[index]?.skill_focus as SkillFocus) || 'mixed',
        score: comp.score || 0,
        timestamp: new Date(comp.completed_at)
      }));

    const completedGoalsCount = completions?.length || 0;
    const missedDays = await calculateMissedDays();
    const averageTimeSpent = completions?.reduce((acc, comp) => acc + (comp.time_spent_minutes || 0), 0) / (completions?.length || 1) || 30;

    return {
      skillLevels,
      recentScores,
      completedGoals: completedGoalsCount,
      missedDays,
      averageTimeSpent
    };
  };

  const calculateMissedDays = async (): Promise<number> => {
    if (!user) return 0;

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Get all goal completions in the last 30 days
    const { data: completions } = await supabase
      .from('goal_completions')
      .select('completed_at')
      .eq('user_id', user.id)
      .gte('completed_at', thirtyDaysAgo.toISOString())
      .lte('completed_at', today.toISOString());

    if (!completions) return 0;

    // Count consecutive missed days from today backwards
    let missedDays = 0;
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const hasCompletion = completions.some(comp => 
        comp.completed_at.startsWith(dateStr)
      );
      
      if (!hasCompletion) {
        missedDays++;
      } else {
        break; // Stop counting when we find a completed day
      }
    }

    return missedDays;
  };

  const isGoalAvailableForToday = (goalDate: string): boolean => {
    const today = new Date().toISOString().split('T')[0];
    return goalDate <= today;
  };

  const generateTodayGoal = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      
      const today = new Date().toISOString().split('T')[0];
      
      // Check if today's goal already exists in completions
      const { data: existingCompletion } = await supabase
        .from('goal_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', today)
        .single();

      if (existingCompletion) {
        // Goal already completed today, get the daily goal info
        const { data: goalData } = await supabase
          .from('daily_goals')
          .select('*')
          .eq('id', existingCompletion.goal_id)
          .single();

        if (goalData) {
          setTodayGoal({
            ...goalData,
            id: goalData.id.toString(),
            userId: user.id,
            goalDate: today,
            isCompleted: true,
            completedAt: existingCompletion.completed_at,
            score: existingCompletion.score,
            timeSpentMinutes: existingCompletion.time_spent_minutes,
            dayNumber: goalData.day_number,
            weekNumber: Math.ceil(goalData.day_number / 7),
            pacingMode: 'BALANCED' as PacingMode,
            goalType: 'foundation' as any,
            skillFocus: goalData.skill_focus as SkillFocus,
            title: goalData.title,
            description: goalData.description || '',
            durationMinutes: goalData.duration_minutes,
            difficultyLevel: 1,
            content: {
              lesson: { keyPoints: [] },
              practice: { exercises: [] },
              microAssessment: { questions: [], timeLimit: 5 }
            }
          });
        }
        return;
      }

      // Get user profile and performance
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!profile || !profile.exam_date) {
        console.error('User profile or exam date not found');
        return;
      }

      const performance = await getUserPerformance();
      
      // Calculate day number based on completed goals
      const dayNumber = performance.completedGoals + 1;

      // Generate adaptive goal
      const adaptiveGoal = AdaptivePacingEngine.generateDailyGoal(
        dayNumber,
        new Date(profile.exam_date),
        performance,
        profile.daily_study_time || 30
      );

      // Create a mock daily goal object for today
      const todayGoalObj: AdaptiveDailyGoal = {
        ...adaptiveGoal,
        id: `adaptive-${dayNumber}-${today}`,
        userId: user.id,
        goalDate: today,
        isCompleted: false
      };

      setTodayGoal(todayGoalObj);
    } catch (error) {
      console.error('Error generating today\'s goal:', error);
    } finally {
      setLoading(false);
    }
  };

  const completeGoal = async (goalId: string, score: number, timeSpent: number): Promise<void> => {
    if (!user) return;

    try {
      const now = new Date().toISOString();

      // Find or create a daily goal to associate with this completion
      const { data: dailyGoal } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('day_number', todayGoal?.dayNumber || 1)
        .single();

      let goalIdToUse = dailyGoal?.id;
      
      // If no daily goal exists, create a basic one
      if (!goalIdToUse) {
        const { data: newGoal } = await supabase
          .from('daily_goals')
          .insert({
            day_number: todayGoal?.dayNumber || 1,
            title: todayGoal?.title || 'Daily Goal',
            description: todayGoal?.description,
            skill_focus: todayGoal?.skillFocus || 'mixed',
            duration_minutes: todayGoal?.durationMinutes || 30
          })
          .select()
          .single();
        
        goalIdToUse = newGoal?.id;
      }

      if (!goalIdToUse) {
        throw new Error('Could not create or find daily goal');
      }

      // Record completion
      const { error: completionError } = await supabase
        .from('goal_completions')
        .insert({
          user_id: user.id,
          goal_id: goalIdToUse,
          completed_at: now,
          score,
          time_spent_minutes: timeSpent
        });

      if (completionError) throw completionError;

      // Update user progress based on skill focus
      if (todayGoal) {
        const skillKey = `${todayGoal.skillFocus}_level` as keyof any;
        const improvement = Math.round((score / 100) * 10); // Convert score to level improvement
        
        await supabase
          .from('user_progress')
          .update({
            [String(skillKey)]: `GREATEST(${skillKey}, ${improvement})`,
            last_assessment_date: now,
            updated_at: now
          })
          .eq('user_id', user.id);
      }

      // Update local state
      if (todayGoal) {
        setTodayGoal({
          ...todayGoal,
          isCompleted: true,
          completedAt: now,
          score,
          timeSpentMinutes: timeSpent
        });
      }

      // Refresh goals
      await refreshGoals();
    } catch (error) {
      console.error('Error completing goal:', error);
    }
  };

  const generateRecoverySession = async (missedDays: number): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);

      const performance = await getUserPerformance();
      const { data: profile } = await supabase
        .from('profiles')
        .select('exam_date')
        .eq('id', user.id)
        .single();

      const pacingMode = profile?.exam_date ? 
        AdaptivePacingEngine.calculatePacingMode(new Date(profile.exam_date)) : 
        'BALANCED';
      
      const recoveryGoal = AdaptivePacingEngine.generateRecoverySession(
        missedDays,
        pacingMode,
        performance
      );

      const today = new Date().toISOString().split('T')[0];

      // Create recovery session as today's goal
      const recoveryGoalObj: AdaptiveDailyGoal = {
        ...recoveryGoal,
        id: `recovery-${today}`,
        userId: user.id,
        goalDate: today,
        isCompleted: false
      };

      setTodayGoal(recoveryGoalObj);
    } catch (error) {
      console.error('Error generating recovery session:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshGoals = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);

      const today = new Date().toISOString().split('T')[0];

      // Get today's completion
      const { data: todayCompletion } = await supabase
        .from('goal_completions')
        .select('*')
        .eq('user_id', user.id)
        .gte('completed_at', today)
        .single();

      if (todayCompletion) {
        // Get the associated daily goal
        const { data: goalData } = await supabase
          .from('daily_goals')
          .select('*')
          .eq('id', todayCompletion.goal_id)
          .single();

        if (goalData) {
          setTodayGoal({
            ...goalData,
            id: goalData.id.toString(),
            userId: user.id,
            goalDate: today,
            isCompleted: true,
            completedAt: todayCompletion.completed_at,
            score: todayCompletion.score,
            timeSpentMinutes: todayCompletion.time_spent_minutes,
            dayNumber: goalData.day_number,
            weekNumber: Math.ceil(goalData.day_number / 7),
            pacingMode: 'BALANCED' as PacingMode,
            goalType: 'foundation' as any,
            skillFocus: goalData.skill_focus as SkillFocus,
            title: goalData.title,
            description: goalData.description || '',
            durationMinutes: goalData.duration_minutes,
            difficultyLevel: 1,
            content: {
              lesson: { keyPoints: [] },
              practice: { exercises: [] },
              microAssessment: { questions: [], timeLimit: 5 }
            }
          });
        }
      } else {
        // No completion today, generate a new goal
        await generateTodayGoal();
      }

      // Get recent completions for completed goals
      const { data: recentCompletions } = await supabase
        .from('goal_completions')
        .select('*, daily_goals!inner(*)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(10);

      if (recentCompletions) {
        const completed = recentCompletions.map(comp => ({
          ...comp.daily_goals,
          id: comp.daily_goals.id.toString(),
          userId: user.id,
          goalDate: comp.completed_at.split('T')[0],
          isCompleted: true,
          completedAt: comp.completed_at,
          score: comp.score,
          timeSpentMinutes: comp.time_spent_minutes,
          dayNumber: comp.daily_goals.day_number,
          weekNumber: Math.ceil(comp.daily_goals.day_number / 7),
          pacingMode: 'BALANCED' as PacingMode,
          goalType: 'foundation' as any,
          skillFocus: comp.daily_goals.skill_focus as SkillFocus,
          title: comp.daily_goals.title,
          description: comp.daily_goals.description || '',
          durationMinutes: comp.daily_goals.duration_minutes,
          difficultyLevel: 1,
          content: {
            lesson: { keyPoints: [] },
            practice: { exercises: [] },
            microAssessment: { questions: [], timeLimit: 5 }
          }
        }));
        
        setCompletedGoals(completed);
      }

      setUpcomingGoals([]); // For now, no upcoming goals with existing schema
    } catch (error) {
      console.error('Error refreshing goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshGoals();
    }
  }, [user]);

  return {
    todayGoal,
    upcomingGoals,
    completedGoals,
    loading,
    generateTodayGoal,
    completeGoal,
    generateRecoverySession,
    refreshGoals
  };
};
