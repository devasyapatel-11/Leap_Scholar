import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, 
  Target, 
  Calendar,
  Clock,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  AlertTriangle,
  CheckCircle,
  ArrowUp,
  ArrowDown,
  Minus,
  Star,
  Award,
  BarChart3,
  Activity
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DynamicProgressDashboardProps {
  userProgress?: any;
  refreshTrigger?: number;
}

interface SkillProgress {
  skill: string;
  currentLevel: number;
  targetLevel: number;
  bandScore: number;
  progress: number;
  trend: 'up' | 'down' | 'stable';
  focusArea: boolean;
  recentScores: number[];
}

interface BandProjection {
  current: number;
  target: number;
  projected: number;
  confidence: number;
  timeline: string;
  gap: number;
}

interface EngagementMetrics {
  weeklyConsistency: number;
  averageSessionTime: number;
  streakDays: number;
  totalStudyHours: number;
  goalsCompleted: number;
  improvementRate: number;
}

const DynamicProgressDashboard: React.FC<DynamicProgressDashboardProps> = ({
  userProgress,
  refreshTrigger
}) => {
  const { user } = useAuth();
  const [skillProgress, setSkillProgress] = useState<SkillProgress[]>([]);
  const [bandProjection, setBandProjection] = useState<BandProjection | null>(null);
  const [engagementMetrics, setEngagementMetrics] = useState<EngagementMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProgressData();
    }
  }, [user, refreshTrigger]);

  const fetchProgressData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user progress
      const { data: progress } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get user profile for target band
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get recent completions for trend analysis
      const { data: completions } = await supabase
        .from('goal_completions')
        .select('*, daily_goals!inner(*)')
        .eq('user_id', user.id)
        .order('completed_at', { ascending: false })
        .limit(20);

      // Get streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Process skill progress
      const skills: SkillProgress[] = [
        {
          skill: 'listening',
          currentLevel: progress?.listening_level || 50,
          targetLevel: 85,
          bandScore: (progress?.listening_level || 50) / 10 + 4.5,
          progress: ((progress?.listening_level || 50) / 85) * 100,
          trend: calculateTrend(completions, 'listening'),
          focusArea: (progress?.listening_level || 50) < 60,
          recentScores: getRecentScores(completions, 'listening')
        },
        {
          skill: 'reading',
          currentLevel: progress?.reading_level || 50,
          targetLevel: 85,
          bandScore: (progress?.reading_level || 50) / 10 + 4.5,
          progress: ((progress?.reading_level || 50) / 85) * 100,
          trend: calculateTrend(completions, 'reading'),
          focusArea: (progress?.reading_level || 50) < 60,
          recentScores: getRecentScores(completions, 'reading')
        },
        {
          skill: 'writing',
          currentLevel: progress?.writing_level || 50,
          targetLevel: 85,
          bandScore: (progress?.writing_level || 50) / 10 + 4.5,
          progress: ((progress?.writing_level || 50) / 85) * 100,
          trend: calculateTrend(completions, 'writing'),
          focusArea: (progress?.writing_level || 50) < 60,
          recentScores: getRecentScores(completions, 'writing')
        },
        {
          skill: 'speaking',
          currentLevel: progress?.speaking_level || 50,
          targetLevel: 85,
          bandScore: (progress?.speaking_level || 50) / 10 + 4.5,
          progress: ((progress?.speaking_level || 50) / 85) * 100,
          trend: calculateTrend(completions, 'speaking'),
          focusArea: (progress?.speaking_level || 50) < 60,
          recentScores: getRecentScores(completions, 'speaking')
        }
      ];

      // Calculate band projection
      const currentOverall = skills.reduce((acc, skill) => acc + skill.bandScore, 0) / 4;
      const targetBand = profile?.target_band_score || 7.0;
      const improvementRate = calculateImprovementRate(completions);
      const projectedBand = Math.min(9.0, currentOverall + improvementRate * 4); // 4 weeks projection

      const projection: BandProjection = {
        current: currentOverall,
        target: targetBand,
        projected: projectedBand,
        confidence: Math.min(95, (completions?.length || 0) * 5),
        timeline: getTimeline(profile?.exam_date),
        gap: targetBand - currentOverall
      };

      // Calculate engagement metrics
      const weeklyConsistency = calculateWeeklyConsistency(completions);
      const averageSessionTime = completions?.reduce((acc, c) => acc + (c.time_spent_minutes || 0), 0) / (completions?.length || 1) || 0;
      const totalStudyHours = (completions?.reduce((acc, c) => acc + (c.time_spent_minutes || 0), 0) || 0) / 60;
      const goalsCompleted = completions?.length || 0;

      const metrics: EngagementMetrics = {
        weeklyConsistency,
        averageSessionTime,
        streakDays: streakData?.current_streak || 0,
        totalStudyHours,
        goalsCompleted,
        improvementRate
      };

      setSkillProgress(skills);
      setBandProjection(projection);
      setEngagementMetrics(metrics);
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateTrend = (completions: any[], skill: string): 'up' | 'down' | 'stable' => {
    const skillCompletions = completions?.filter(c => c.daily_goals?.skill_focus === skill) || [];
    if (skillCompletions.length < 2) return 'stable';

    const recent = skillCompletions.slice(0, 3);
    const previous = skillCompletions.slice(3, 6);

    const recentAvg = recent.reduce((acc, c) => acc + (c.score || 0), 0) / recent.length;
    const previousAvg = previous.length > 0 ? previous.reduce((acc, c) => acc + (c.score || 0), 0) / previous.length : recentAvg;

    if (recentAvg > previousAvg + 5) return 'up';
    if (recentAvg < previousAvg - 5) return 'down';
    return 'stable';
  };

  const getRecentScores = (completions: any[], skill: string): number[] => {
    return completions
      ?.filter(c => c.daily_goals?.skill_focus === skill && c.score)
      .slice(0, 5)
      .map(c => c.score) || [];
  };

  const calculateImprovementRate = (completions: any[]): number => {
    if (!completions || completions.length < 2) return 0.1;

    const scores = completions.map(c => c.score || 50);
    const recent = scores.slice(0, 5);
    const earlier = scores.slice(5, 10);

    if (earlier.length === 0) return 0.1;

    const recentAvg = recent.reduce((acc, s) => acc + s, 0) / recent.length;
    const earlierAvg = earlier.reduce((acc, s) => acc + s, 0) / earlier.length;

    return (recentAvg - earlierAvg) / 100; // Convert to band score improvement
  };

  const calculateWeeklyConsistency = (completions: any[]): number => {
    if (!completions) return 0;

    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);

    const weeklyCompletions = completions.filter(c => 
      new Date(c.completed_at) >= lastWeek
    );

    const uniqueDays = new Set(
      weeklyCompletions.map(c => c.completed_at.split('T')[0])
    );

    return (uniqueDays.size / 7) * 100;
  };

  const getTimeline = (examDate?: string): string => {
    if (!examDate) return 'Unknown';
    
    const daysUntil = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntil <= 30) return `${daysUntil} days (INTENSIVE)`;
    if (daysUntil <= 90) return `${Math.ceil(daysUntil / 7)} weeks (BALANCED)`;
    return `${Math.ceil(daysUntil / 30)} months (STEADY BUILD)`;
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case 'listening': return <Headphones className="w-4 h-4" />;
      case 'reading': return <BookOpen className="w-4 h-4" />;
      case 'writing': return <PenLine className="w-4 h-4" />;
      case 'speaking': return <Mic className="w-4 h-4" />;
      default: return <Target className="w-4 h-4" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <ArrowUp className="w-4 h-4 text-green-600" />;
      case 'down': return <ArrowDown className="w-4 h-4 text-red-600" />;
      default: return <Minus className="w-4 h-4 text-gray-400" />;
    }
  };

  const getProgressColor = (progress: number): string => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Band Score Projection */}
      {bandProjection && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-5 h-5" />
              Band Score Projection
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {bandProjection.current.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Current</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {bandProjection.projected.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Projected</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {bandProjection.target.toFixed(1)}
                </div>
                <div className="text-sm text-gray-600">Target</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to Target</span>
                <span>{Math.round((bandProjection.current / bandProjection.target) * 100)}%</span>
              </div>
              <Progress value={(bandProjection.current / bandProjection.target) * 100} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>{bandProjection.timeline}</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4" />
                <span>Gap: {bandProjection.gap.toFixed(1)} bands</span>
              </div>
            </div>

            {bandProjection.gap > 0 && (
              <div className="p-3 bg-yellow-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-yellow-800">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Focus on your weakest areas to close the gap</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Skill Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Skill Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillProgress.map((skill) => (
            <div key={skill.skill} className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getSkillIcon(skill.skill)}
                  <span className="capitalize font-medium">{skill.skill}</span>
                  {skill.focusArea && (
                    <Badge variant="outline" className="text-xs">
                      Focus Area
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getTrendIcon(skill.trend)}
                  <span className="text-sm font-medium">
                    Band {skill.bandScore.toFixed(1)}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(skill.progress)}%</span>
                </div>
                <Progress value={skill.progress} className="h-2" />
              </div>

              {skill.recentScores.length > 0 && (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Recent scores:</span>
                  <div className="flex gap-1">
                    {skill.recentScores.map((score, index) => (
                      <span key={index} className="px-1 py-0.5 bg-gray-100 rounded">
                        {score}%
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Engagement Metrics */}
      {engagementMetrics && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Engagement Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {engagementMetrics.weeklyConsistency.toFixed(0)}%
                </div>
                <div className="text-sm text-blue-800">Weekly Consistency</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {engagementMetrics.streakDays}
                </div>
                <div className="text-sm text-green-800">Day Streak</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Math.round(engagementMetrics.averageSessionTime)}m
                </div>
                <div className="text-sm text-purple-800">Avg Session</div>
              </div>
              <div className="text-center p-4 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {Math.round(engagementMetrics.totalStudyHours)}h
                </div>
                <div className="text-sm text-orange-800">Total Study</div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Goals Completed</span>
                <span className="font-medium">{engagementMetrics.goalsCompleted}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Improvement Rate</span>
                <span className="font-medium">
                  +{(engagementMetrics.improvementRate * 10).toFixed(1)} bands/week
                </span>
              </div>
            </div>

            {engagementMetrics.weeklyConsistency >= 80 && (
              <div className="p-3 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-sm text-green-800">
                  <CheckCircle className="w-4 h-4" />
                  <span>Excellent consistency! You're on track for your target.</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DynamicProgressDashboard;
