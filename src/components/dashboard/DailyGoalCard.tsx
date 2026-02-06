import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Flame, CheckCircle, Clock, Headphones, BookOpen, PenLine, Mic, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyGoalCardProps {
  currentDay: number;
  goal: {
    id: number;
    title: string;
    description: string | null;
    skill_focus: string;
    duration_minutes: number;
  } | null;
  streak: number;
  yesterdayCompleted: boolean;
}

const skillIcons: Record<string, typeof Headphones> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
  mixed: Sparkles,
};

const skillColors: Record<string, string> = {
  listening: 'bg-chart-listening text-white',
  reading: 'bg-chart-reading text-white',
  writing: 'bg-chart-writing text-white',
  speaking: 'bg-chart-speaking text-white',
  mixed: 'bg-primary text-primary-foreground',
};

export function DailyGoalCard({ currentDay, goal, streak, yesterdayCompleted }: DailyGoalCardProps) {
  const navigate = useNavigate();
  const SkillIcon = goal ? skillIcons[goal.skill_focus] || Sparkles : Sparkles;

  const handleStartGoal = () => {
    navigate(`/goal/${currentDay}`);
  };

  if (currentDay > 28) {
    return (
      <Card className="border-2 border-success bg-success/5">
        <CardContent className="pt-6 text-center">
          <div className="w-16 h-16 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-success" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            Congratulations! 🎉
          </h2>
          <p className="text-muted-foreground">
            You've completed the Leap Scholar 28-day IELTS preparation program!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-2 border-primary/20 overflow-hidden">
      <CardHeader className="bg-primary/5 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-sm font-medium text-muted-foreground">
              Day {currentDay} of 28
            </div>
            {streak > 0 && (
              <div className="flex items-center gap-1 text-warning">
                <Flame className="w-4 h-4" />
                <span className="text-sm font-semibold">{streak} day streak</span>
              </div>
            )}
          </div>
          
          {yesterdayCompleted && (
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">
              <CheckCircle className="w-3 h-3 mr-1" />
              Yesterday completed
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-6">
        {goal ? (
          <>
            <div className="flex items-start gap-4 mb-6">
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                skillColors[goal.skill_focus]
              )}>
                <SkillIcon className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">
                  {goal.title}
                </h2>
                {goal.description && (
                  <p className="text-muted-foreground">
                    {goal.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{goal.duration_minutes} minutes</span>
              </div>

              <Button size="lg" className="gap-2" onClick={handleStartGoal}>
                <Play className="w-4 h-4" />
                Start Today's Goal
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No goal available for today. Check back soon!
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
