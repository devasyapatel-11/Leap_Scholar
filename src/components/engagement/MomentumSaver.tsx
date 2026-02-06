import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Heart, 
  ArrowRight, 
  Calendar,
  TrendingUp,
  Target,
  Sparkles,
  RefreshCw,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface MomentumSaverProps {
  onRecoveryStart: (missedDays: number) => void;
  onRecoveryComplete: () => void;
}

interface RecoveryData {
  missedDays: number;
  comebackStreak: number;
  lastActivityDate: string | null;
  totalMissedDays: number;
  recoverySessions: number;
}

const MomentumSaver: React.FC<MomentumSaverProps> = ({
  onRecoveryStart,
  onRecoveryComplete
}) => {
  const { user } = useAuth();
  const [recoveryData, setRecoveryData] = useState<RecoveryData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRecovery, setShowRecovery] = useState(false);

  useEffect(() => {
    if (user) {
      fetchRecoveryData();
    }
  }, [user]);

  const fetchRecoveryData = async () => {
    if (!user) return;

    try {
      setLoading(true);

      // Get user streak data
      const { data: streakData } = await supabase
        .from('user_streaks')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // Get recent completions to calculate missed days
      const today = new Date();
      const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      const { data: completions } = await supabase
        .from('goal_completions')
        .select('completed_at')
        .eq('user_id', user.id)
        .gte('completed_at', thirtyDaysAgo.toISOString())
        .order('completed_at', { ascending: false });

      // Calculate missed days
      let missedDays = 0;
      let totalMissedDays = 0;
      let lastActivityDate = streakData?.last_activity_date || null;

      for (let i = 0; i < 30; i++) {
        const checkDate = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
        const dateStr = checkDate.toISOString().split('T')[0];
        
        const hasCompletion = completions?.some(comp => 
          comp.completed_at.startsWith(dateStr)
        );
        
        if (!hasCompletion) {
          totalMissedDays++;
          if (i === 0) missedDays++;
        } else if (i === 0) {
          lastActivityDate = dateStr;
        }
      }

      // Calculate comeback streak (consecutive days after returning)
      let comebackStreak = 0;
      if (completions && completions.length > 0) {
        const sortedDates = completions.map(c => c.completed_at.split('T')[0]);
        let currentStreak = 1;
        
        for (let i = 1; i < sortedDates.length; i++) {
          const prevDate = new Date(sortedDates[i - 1]);
          const currDate = new Date(sortedDates[i]);
          const dayDiff = (prevDate.getTime() - currDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            currentStreak++;
          } else {
            break;
          }
        }
        comebackStreak = currentStreak;
      }

      setRecoveryData({
        missedDays,
        comebackStreak,
        lastActivityDate,
        totalMissedDays,
        recoverySessions: totalMissedDays > 0 ? Math.ceil(totalMissedDays / 3) : 0
      });

      // Show recovery modal if missed 3+ days
      if (missedDays >= 3) {
        setShowRecovery(true);
      }
    } catch (error) {
      console.error('Error fetching recovery data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRecoveryMessage = (missedDays: number): { title: string; message: string; type: 'gentle' | 'supportive' | 'urgent' } => {
    if (missedDays === 1) {
      return {
        title: "One day off? No worries!",
        message: "Everyone needs a break. Ready to get back on track tomorrow?",
        type: 'gentle'
      };
    } else if (missedDays === 2) {
      return {
        title: "Two-day break happens!",
        message: "Life gets busy. A quick catch-up session will get you back in the flow.",
        type: 'gentle'
      };
    } else if (missedDays <= 7) {
      return {
        title: "Welcome back! We missed you.",
        message: `It's been ${missedDays} days. Don't worry - we've created a special recovery session to get you back on track.`,
        type: 'supportive'
      };
    } else {
      return {
        title: "Time for a fresh start!",
        message: `It's been ${missedDays} days. The best time to restart was yesterday. The second best time is now.`,
        type: 'supportive'
      };
    }
  };

  const handleStartRecovery = () => {
    if (recoveryData) {
      onRecoveryStart(recoveryData.missedDays);
      setShowRecovery(false);
    }
  };

  const handleSkipRecovery = () => {
    setShowRecovery(false);
  };

  const renderRecoveryModal = () => {
    if (!recoveryData || !showRecovery) return null;

    const { missedDays, comebackStreak } = recoveryData;
    const message = getRecoveryMessage(missedDays);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-center">
              <Heart className="w-5 h-5 text-red-500" />
              {message.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center space-y-4">
              <p className="text-gray-600">{message.message}</p>
              
              {missedDays >= 3 && (
                <div className="p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <RefreshCw className="w-5 h-5 text-orange-600" />
                    <span className="font-medium text-orange-800">Quick Recovery Session</span>
                  </div>
                  <p className="text-sm text-orange-700">
                    {missedDays <= 5 
                      ? `20-minute session covering the essentials from your missed days`
                      : `30-minute condensed session to rebuild your momentum`
                    }
                  </p>
                </div>
              )}

              {comebackStreak > 0 && (
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="font-medium text-green-800">
                      Comeback Day {comebackStreak + 1}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <Button 
                onClick={handleStartRecovery}
                className="w-full"
                size="lg"
              >
                {missedDays <= 2 ? 'Continue Today\'s Goal' : 'Start Recovery Session'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              
              <Button 
                variant="outline" 
                onClick={handleSkipRecovery}
                className="w-full"
              >
                I'll start tomorrow
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderRecoveryStats = () => {
    if (!recoveryData || recoveryData.missedDays === 0) return null;

    const { missedDays, comebackStreak, totalMissedDays, recoverySessions } = recoveryData;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Momentum Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {missedDays > 0 && (
            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-yellow-800">Current Status</span>
                <Badge variant="outline" className="text-yellow-800">
                  {missedDays} {missedDays === 1 ? 'day' : 'days'} missed
                </Badge>
              </div>
              <p className="text-sm text-yellow-700">
                {missedDays === 1 && "One day off - you're still building momentum!"}
                {missedDays === 2 && "Two-day break - ready to get back on track?"}
                {missedDays >= 3 && "Time for a recovery session to rebuild momentum"}
              </p>
            </div>
          )}

          {comebackStreak > 0 && (
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-green-800">Comeback Streak</span>
                <Badge className="bg-green-600">
                  {comebackStreak} {comebackStreak === 1 ? 'day' : 'days'}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={(comebackStreak / 7) * 100} className="flex-1" />
                <span className="text-sm text-green-700">Day {comebackStreak}/7</span>
              </div>
              <p className="text-sm text-green-700 mt-2">
                {comebackStreak >= 7 
                  ? "Amazing consistency! You're back in the rhythm."
                  : comebackStreak >= 3
                  ? "Great comeback! Keep this momentum going."
                  : "Welcome back! Every day counts."
                }
              </p>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <div className="font-medium text-gray-600">Total Missed Days</div>
              <div className="text-lg font-bold text-gray-800">{totalMissedDays}</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-600">Recovery Sessions</div>
              <div className="text-lg font-bold text-gray-800">{recoverySessions}</div>
            </div>
          </div>

          {missedDays >= 3 && (
            <Button 
              onClick={handleStartRecovery}
              className="w-full"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Start Recovery Session
            </Button>
          )}
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
      {renderRecoveryStats()}
      {renderRecoveryModal()}
    </>
  );
};

export default MomentumSaver;
