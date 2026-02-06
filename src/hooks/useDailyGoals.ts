import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AdaptivePacingEngine, AdaptiveGoal, UserPerformance, PacingMode, SkillFocus } from '@/lib/adaptivePacing';

export interface DailyGoal extends AdaptiveGoal {
  id: string;
  userId: string;
  goalDate: string;
  isCompleted: boolean;
  completedAt?: string;
  score?: number;
  timeSpentMinutes?: number;
}

export interface UseDailyGoalsReturn {
  todayGoal: DailyGoal | null;
  upcomingGoals: DailyGoal[];
  completedGoals: DailyGoal[];
  loading: boolean;
  generateTodayGoal: () => Promise<void>;
  completeGoal: (goalId: string, score: number, timeSpent: number) => Promise<void>;
  generateRecoverySession: (missedDays: number) => Promise<void>;
  refreshGoals: () => Promise<void>;
}

export const useDailyGoals = (): UseDailyGoalsReturn => {
  const { user } = useAuth();
  const [todayGoal, setTodayGoal] = useState<DailyGoal | null>(null);
  const [upcomingGoals, setUpcomingGoals] = useState<DailyGoal[]>([]);
  const [completedGoals, setCompletedGoals] = useState<DailyGoal[]>([]);
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
    const { data: dailyGoalsData } = await supabase
      .from('daily_goals')
      .select('skill_focus')
      .eq('id', completions?.[0]?.goal_id || 1)
      .single();

    const skillLevels: Record<SkillFocus, number> = {
      listening: progress?.listening_level || 50,
      reading: progress?.reading_level || 50,
      writing: progress?.writing_level || 50,
      speaking: progress?.speaking_level || 50,
      mixed: 50
    };

    const recentScores = (completions || [])
      .filter(comp => comp.score)
      .map(comp => ({
        skillFocus: (dailyGoalsData?.skill_focus as SkillFocus) || 'mixed',
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

    // Get all goals in the last 30 days
    const { data: goals } = await supabase
      .from('adaptive_daily_goals')
      .select('goal_date, is_completed')
      .eq('user_id', user.id)
      .gte('goal_date', thirtyDaysAgo.toISOString().split('T')[0])
      .lte('goal_date', today.toISOString().split('T')[0]);

    if (!goals) return 0;

    // Count consecutive missed days from today backwards
    let missedDays = 0;
    const todayStr = today.toISOString().split('T')[0];
    
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = checkDate.toISOString().split('T')[0];
      
      const dayGoal = goals.find(g => g.goal_date === dateStr);
      
      if (!dayGoal || !dayGoal.is_completed) {
        missedDays++;
      } else {
        break; // Stop counting when we find a completed day
      }
    }

    return missedDays;
  };

  const generateTodayGoal = async (): Promise<void> => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check if today's goal already exists
      const today = new Date().toISOString().split('T')[0];
      const { data: existingGoal } = await supabase
        .from('adaptive_daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_date', today)
        .single();

      if (existingGoal) {
        setTodayGoal(existingGoal as DailyGoal);
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
      
      // Calculate day number
      const { data: completedGoals } = await supabase
        .from('adaptive_daily_goals')
        .select('day_number')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('day_number', { ascending: false })
        .limit(1);

      const dayNumber = (completedGoals?.[0]?.day_number || 0) + 1;

      // Generate adaptive goal
      const adaptiveGoal = AdaptivePacingEngine.generateDailyGoal(
        dayNumber,
        new Date(profile.exam_date),
        performance,
        profile.daily_study_time || 30
      );

      // Save to database
      const { data: newGoal, error } = await supabase
        .from('adaptive_daily_goals')
        .insert({
          user_id: user.id,
          goal_date: today,
          day_number: dayNumber,
          week_number: Math.ceil(dayNumber / 7),
          pacing_mode: adaptiveGoal.pacingMode,
          goal_type: adaptiveGoal.goalType,
          skill_focus: adaptiveGoal.skillFocus,
          title: adaptiveGoal.title,
          description: adaptiveGoal.description,
          duration_minutes: adaptiveGoal.durationMinutes,
          difficulty_level: adaptiveGoal.difficultyLevel,
          content: adaptiveGoal.content,
          micro_assessment: adaptiveGoal.content.microAssessment
        })
        .select()
        .single();

      if (error) throw error;

      setTodayGoal(newGoal as DailyGoal);
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

      // Update adaptive daily goal
      const { error: goalError } = await supabase
        .from('adaptive_daily_goals')
        .update({
          is_completed: true,
          completed_at: now,
          score,
          time_spent_minutes: timeSpent
        })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (goalError) throw goalError;

      // Update user progress based on skill focus
      const { data: goalData } = await supabase
        .from('adaptive_daily_goals')
        .select('skill_focus, score')
        .eq('id', goalId)
        .single();

      if (goalData) {
        const skillKey = `${goalData.skill_focus}_level` as keyof any;
        const improvement = Math.round((score / 100) * 10); // Convert score to level improvement
        
        await supabase
          .from('user_progress')
          .update({
            [skillKey]: `GREATEST(${skillKey}, ${improvement})`,
            last_assessment_date: now,
            updated_at: now
          })
          .eq('user_id', user.id);
      }

      // Record in goal_completions for compatibility
      const { error: completionError } = await supabase
        .from('goal_completions')
        .insert({
          user_id: user.id,
          goal_id: parseInt(goalId),
          completed_at: now,
          score,
          time_spent_minutes: timeSpent
        });

      if (completionError) throw completionError;

      // Update local state
      if (todayGoal && todayGoal.id === goalId) {
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
        .select('pacing_mode')
        .eq('id', user.id)
        .single();

      const pacingMode = (profile?.pacing_mode as PacingMode) || 'BALANCED';
      
      const recoveryGoal = AdaptivePacingEngine.generateRecoverySession(
        missedDays,
        pacingMode,
        performance
      );

      const today = new Date().toISOString().split('T')[0];

      // Save recovery session
      const { data: newGoal, error } = await supabase
        .from('adaptive_daily_goals')
        .insert({
          user_id: user.id,
          goal_date: today,
          day_number: 0, // Special recovery session
          week_number: 0,
          pacing_mode: recoveryGoal.pacingMode,
          goal_type: 'recovery',
          skill_focus: recoveryGoal.skillFocus,
          title: recoveryGoal.title,
          description: recoveryGoal.description,
          duration_minutes: recoveryGoal.durationMinutes,
          difficulty_level: recoveryGoal.difficultyLevel,
          content: recoveryGoal.content,
          micro_assessment: recoveryGoal.content.microAssessment
        })
        .select()
        .single();

      if (error) throw error;

      // Record recovery session
      await supabase
        .from('recovery_sessions')
        .insert({
          user_id: user.id,
          missed_days: missedDays,
          recovery_type: missedDays <= 2 ? 'quick_catchup' : 'condensed_session',
          content: recoveryGoal.content,
          comeback_day_number: 1
        });

      setTodayGoal(newGoal as DailyGoal);
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

      // Get today's goal
      const { data: todayData } = await supabase
        .from('adaptive_daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('goal_date', today)
        .single();

      setTodayGoal(todayData as DailyGoal || null);

      // Get upcoming goals (next 7 days)
      const { data: upcomingData } = await supabase
        .from('adaptive_daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .gt('goal_date', today)
        .order('goal_date', { ascending: true })
        .limit(7);

      setUpcomingGoals((upcomingData || []) as DailyGoal[]);

      // Get completed goals (last 10)
      const { data: completedData } = await supabase
        .from('adaptive_daily_goals')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_completed', true)
        .order('completed_at', { ascending: false })
        .limit(10);

      setCompletedGoals((completedData || []) as DailyGoal[]);
    } catch (error) {
      console.error('Error refreshing goals:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      refreshGoals();
      if (!todayGoal) {
        generateTodayGoal();
      }
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
