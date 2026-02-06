 import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { useAdaptiveDailyGoals } from '@/hooks/useAdaptiveDailyGoals';
import { supabase } from '@/integrations/supabase/client';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import AdaptiveDailyGoalCard from '@/components/dashboard/AdaptiveDailyGoalCard';
import DynamicProgressDashboard from '@/components/dashboard/DynamicProgressDashboard';
import MomentumSaver from '@/components/engagement/MomentumSaver';
import WeeklyCheckIn from '@/components/engagement/WeeklyCheckIn';
import { Loader2 } from 'lucide-react';

interface DailyGoal {
  id: number;
  day_number: number;
  title: string;
  description: string | null;
  skill_focus: string;
  duration_minutes: number;
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { profile, progress, streak, loading } = useProfile();
  const { todayGoal, completeGoal, generateRecoverySession } = useAdaptiveDailyGoals();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    if (!loading && profile && !profile.onboarding_completed) {
      navigate('/onboarding');
    }
  }, [profile, loading, navigate]);

  const handleGoalComplete = (score: number, timeSpent: number) => {
    if (todayGoal) {
      completeGoal(todayGoal.id, score, timeSpent);
      setRefreshTrigger(prev => prev + 1);
    }
  };

  const handleRecoveryStart = (missedDays: number) => {
    generateRecoverySession(missedDays);
  };

  const handleRecoveryComplete = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleWeekComplete = (weekData: any) => {
    console.log('Week completed:', weekData);
    setRefreshTrigger(prev => prev + 1);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader 
        examDate={profile?.exam_date ? new Date(profile.exam_date) : null}
      />

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content - 2 columns on desktop */}
          <div className="lg:col-span-2 space-y-6">
            <AdaptiveDailyGoalCard 
              goal={todayGoal}
              onComplete={handleGoalComplete}
              onStartRecovery={handleRecoveryStart}
              missedDays={0} // This would be calculated from actual data
            />
            
            <DynamicProgressDashboard 
              refreshTrigger={refreshTrigger}
            />
          </div>

          {/* Sidebar - 1 column */}
          <div className="space-y-6">
            <MomentumSaver 
              onRecoveryStart={handleRecoveryStart}
              onRecoveryComplete={handleRecoveryComplete}
            />
            <WeeklyCheckIn 
              onWeekComplete={handleWeekComplete}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
   