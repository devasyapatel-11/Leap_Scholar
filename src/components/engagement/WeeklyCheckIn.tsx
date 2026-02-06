import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Calendar, 
  TrendingUp, 
  Target, 
  Award,
  Star,
  CheckCircle,
  Clock,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  ArrowRight,
  Sparkles,
  Trophy
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface WeeklyCheckInProps {
  onWeekComplete: (weekData: WeeklyReport) => void;
}

interface WeeklyReport {
  weekNumber: number;
  daysActive: number;
  goalsCompleted: number;
  totalStudyTime: number;
  skillProgress: Record<string, { start: number; current: number; improvement: number }>;
  overallBandStart: number;
  overallBandCurrent: number;
  projectedBand: number;
  nextWeekFocus: string[];
  milestoneAchieved?: string;
}

const WeeklyCheckIn: React.FC<WeeklyCheckInProps> = ({ onWeekComplete }) => {
  const { user } = useAuth();
  const [weeklyReport, setWeeklyReport] = useState<WeeklyReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    if (user) {
      generateWeeklyReport();
    }
  }, [user]);

  const getWeekNumber = (): number => {
    const userStartDate = new Date(); // This should come from user profile
    const today = new Date();
    const weekNumber = Math.ceil((today.getTime() - userStartDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    return Math.max(1, weekNumber);
  };

  const generateWeeklyReport = async () => {
    if (!user) return;

    try {
      setLoading(true);

      const weekNumber = getWeekNumber();
      const today = new Date();
      const weekStart = new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000);
      const weekStartStr = weekStart.toISOString().split('T')[0];
      const todayStr = today.toISOString().split('T')[0];

      // Get completions for this week
      const { data: completions } = await supabase
        .from('goal_completions')
        .select('*, daily_goals!inner(*)')
        .eq('user_id', user.id)
        .gte('completed_at', weekStartStr)
        .lte('completed_at', todayStr);

      // Get user progress at start and current
      const { data: currentProgress } = await supabase
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

      // Calculate weekly stats
      const uniqueDays = new Set(
        completions?.map(c => c.completed_at.split('T')[0]) || []
      );
      const daysActive = uniqueDays.size;
      const goalsCompleted = completions?.length || 0;
      const totalStudyTime = completions?.reduce((acc, c) => acc + (c.time_spent_minutes || 0), 0) || 0;

      // Calculate skill progress
      const skillProgress = {
        listening: { start: 50, current: currentProgress?.listening_level || 50, improvement: 0 },
        reading: { start: 50, current: currentProgress?.reading_level || 50, improvement: 0 },
        writing: { start: 50, current: currentProgress?.writing_level || 50, improvement: 0 },
        speaking: { start: 50, current: currentProgress?.speaking_level || 50, improvement: 0 }
      };

      // Simulate some improvement for demo
      Object.keys(skillProgress).forEach(skill => {
        const improvement = Math.floor(Math.random() * 15) + 5; // 5-20% improvement
        skillProgress[skill].current = Math.min(100, skillProgress[skill].start + improvement);
        skillProgress[skill].improvement = improvement;
      });

      const overallBandStart = 6.0;
      const overallBandCurrent = Math.min(9.0, overallBandStart + (goalsCompleted * 0.1));
      const projectedBand = Math.min(9.0, overallBandCurrent + (4 - weekNumber) * 0.15);

      // Determine next week focus
      const weakestSkills = Object.entries(skillProgress)
        .sort(([, a], [, b]) => a.improvement - b.improvement)
        .slice(0, 2)
        .map(([skill]) => skill);

      // Determine milestone
      let milestoneAchieved: string | undefined;
      if (daysActive === 7) {
        milestoneAchieved = 'Perfect Week - 7/7 days active!';
      } else if (goalsCompleted >= 6) {
        milestoneAchieved = 'Goal Crusher - 6+ goals completed!';
      } else if (totalStudyTime >= 180) {
        milestoneAchieved = 'Dedicated Learner - 3+ hours studied!';
      } else if (weekNumber === 4) {
        milestoneAchieved = 'First Month Complete!';
      }

      const report: WeeklyReport = {
        weekNumber,
        daysActive,
        goalsCompleted,
        totalStudyTime,
        skillProgress,
        overallBandStart,
        overallBandCurrent,
        projectedBand,
        nextWeekFocus: weakestSkills,
        milestoneAchieved
      };

      setWeeklyReport(report);

      // Show report on Sunday
      if (today.getDay() === 0) {
        setShowReport(true);
      }
    } catch (error) {
      console.error('Error generating weekly report:', error);
    } finally {
      setLoading(false);
    }
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

  const getMilestoneIcon = (milestone: string) => {
    if (milestone?.includes('Perfect')) return <Star className="w-6 h-6 text-yellow-500" />;
    if (milestone?.includes('Goal')) return <Trophy className="w-6 h-6 text-purple-500" />;
    if (milestone?.includes('Dedicated')) return <Award className="w-6 h-6 text-blue-500" />;
    if (milestone?.includes('Month')) return <Sparkles className="w-6 h-6 text-green-500" />;
    return <CheckCircle className="w-6 h-6 text-green-500" />;
  };

  const renderWeeklyReport = () => {
    if (!weeklyReport) return null;

    const {
      weekNumber,
      daysActive,
      goalsCompleted,
      totalStudyTime,
      skillProgress,
      overallBandStart,
      overallBandCurrent,
      projectedBand,
      nextWeekFocus,
      milestoneAchieved
    } = weeklyReport;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-center">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Calendar className="w-6 h-6" />
                Week {weekNumber} Complete!
              </div>
              {milestoneAchieved && (
                <div className="flex items-center justify-center gap-2 text-lg">
                  {getMilestoneIcon(milestoneAchieved)}
                  <span className="text-green-600 font-bold">{milestoneAchieved}</span>
                </div>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Weekly Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{daysActive}/7</div>
                <div className="text-sm text-blue-800">Days Active</div>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{goalsCompleted}</div>
                <div className="text-sm text-green-800">Goals Completed</div>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{Math.round(totalStudyTime / 60)}h</div>
                <div className="text-sm text-purple-800">Study Time</div>
              </div>
            </div>

            {/* Skill Progress */}
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Skills Progress
              </h4>
              {Object.entries(skillProgress).map(([skill, progress]) => (
                <div key={skill} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getSkillIcon(skill)}
                      <span className="capitalize">{skill}</span>
                    </div>
                    <span className="font-medium">
                      {progress.start}% → {progress.current}% (+{progress.improvement}%)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={progress.current} className="flex-1" />
                    <span className="text-xs text-gray-500 w-12">{progress.current}%</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Band Score Progress */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
              <h4 className="font-medium mb-3">Band Score Journey</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Start of Week:</span>
                  <span className="font-medium">Band {overallBandStart}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Current:</span>
                  <span className="font-medium text-green-600">Band {overallBandCurrent.toFixed(1)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Projected:</span>
                  <span className="font-medium text-blue-600">Band {projectedBand.toFixed(1)}</span>
                </div>
                <Progress value={(overallBandCurrent / 9.0) * 100} className="mt-2" />
              </div>
            </div>

            {/* Next Week Focus */}
            <div className="p-4 bg-yellow-50 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Week {weekNumber + 1} Focus
              </h4>
              <div className="space-y-2">
                {nextWeekFocus.map((skill, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    {getSkillIcon(skill)}
                    <span>Intensive {skill} practice</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Badge */}
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Award className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Week {weekNumber} Champion!</span>
              </div>
              <p className="text-sm text-green-700">
                You're building amazing momentum. Keep this energy going into next week!
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => {
                  setShowReport(false);
                  onWeekComplete(weeklyReport);
                }}
                className="flex-1"
              >
                Continue to Week {weekNumber + 1}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <Button variant="outline" onClick={() => setShowReport(false)}>
                Close
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderWeeklyPreview = () => {
    if (!weeklyReport) return null;

    const { daysActive, goalsCompleted, weekNumber } = weeklyReport;
    const weekProgress = (daysActive / 7) * 100;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Week {weekNumber} Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Weekly Progress</span>
              <span>{daysActive}/7 days</span>
            </div>
            <Progress value={weekProgress} />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium">{goalsCompleted}</div>
              <div className="text-gray-600">Goals Done</div>
            </div>
            <div className="text-center">
              <div className="font-medium">{Math.round(weeklyReport.totalStudyTime / 60)}h</div>
              <div className="text-gray-600">Study Time</div>
            </div>
          </div>

          {weeklyReport.milestoneAchieved && (
            <div className="p-3 bg-green-50 rounded-lg text-center">
              <div className="flex items-center justify-center gap-2">
                {getMilestoneIcon(weeklyReport.milestoneAchieved)}
                <span className="text-sm font-medium text-green-800">
                  {weeklyReport.milestoneAchieved}
                </span>
              </div>
            </div>
          )}

          <Button 
            onClick={() => setShowReport(true)}
            variant="outline"
            className="w-full"
          >
            View Full Report
          </Button>
        </CardContent>
      </Card>
    );
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
    <>
      {renderWeeklyPreview()}
      {showReport && renderWeeklyReport()}
    </>
  );
};

export default WeeklyCheckIn;
