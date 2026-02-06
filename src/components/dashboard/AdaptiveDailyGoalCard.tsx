import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Clock, 
  Target, 
  Play, 
  CheckCircle, 
  Calendar,
  Timer,
  TrendingUp,
  BookOpen,
  Headphones,
  PenLine,
  Mic,
  Star,
  Lock
} from 'lucide-react';
import { AdaptiveDailyGoal } from '@/hooks/useAdaptiveDailyGoals';
import MicroAssessment from '@/components/assessment/MicroAssessment';

interface AdaptiveDailyGoalCardProps {
  goal: AdaptiveDailyGoal | null;
  onComplete: (score: number, timeSpent: number) => void;
  onStartRecovery: (missedDays: number) => void;
  missedDays: number;
}

const AdaptiveDailyGoalCard: React.FC<AdaptiveDailyGoalCardProps> = ({
  goal,
  onComplete,
  onStartRecovery,
  missedDays
}) => {
  const [currentPhase, setCurrentPhase] = useState<'overview' | 'lesson' | 'practice' | 'assessment' | 'completed'>('overview');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [assessmentResults, setAssessmentResults] = useState<any>(null);

  const isGoalAvailable = (): boolean => {
    if (!goal) return false;
    const today = new Date().toISOString().split('T')[0];
    return goal.goalDate === today;
  };

  const getDaysUntilAvailable = (): number => {
    if (!goal) return 0;
    const today = new Date();
    const goalDate = new Date(goal.goalDate);
    const diffTime = goalDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (!goal) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-gray-500">
            <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No goal available for today</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getSkillIcon = (skillFocus: string) => {
    switch (skillFocus) {
      case 'listening': return <Headphones className="w-5 h-5" />;
      case 'reading': return <BookOpen className="w-5 h-5" />;
      case 'writing': return <PenLine className="w-5 h-5" />;
      case 'speaking': return <Mic className="w-5 h-5" />;
      default: return <Target className="w-5 h-5" />;
    }
  };

  const getPacingColor = (pacingMode: string) => {
    switch (pacingMode) {
      case 'INTENSIVE': return 'bg-red-500';
      case 'BALANCED': return 'bg-blue-500';
      case 'STEADY_BUILD': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getDifficultyColor = (level: number) => {
    if (level <= 2) return 'text-green-600';
    if (level <= 3) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleStartGoal = () => {
    if (!isGoalAvailable()) {
      return; // Don't allow starting if not available
    }
    setStartTime(Date.now());
    setCurrentPhase('lesson');
  };

  const handleCompleteAssessment = (results: any) => {
    setAssessmentResults(results);
    setCurrentPhase('completed');
    
    const timeSpent = startTime ? Math.round((Date.now() - startTime) / 1000 / 60) : goal.durationMinutes;
    onComplete(results.score, timeSpent);
  };

  const renderOverview = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getSkillIcon(goal.skillFocus)}
            <span>Today's Goal</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Day {goal.dayNumber}
            </Badge>
            <Badge className={`text-xs ${getPacingColor(goal.pacingMode)}`}>
              {goal.pacingMode}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goal.goalType === 'recovery' ? (
          <div className="text-center space-y-4">
            <div className="p-4 bg-orange-50 rounded-lg">
              <h3 className="text-lg font-medium text-orange-800 mb-2">
                Welcome Back! 🎯
              </h3>
              <p className="text-orange-700">
                Life happens! Let's get you back on track with a quick recovery session.
              </p>
            </div>
            <Button 
              onClick={() => onStartRecovery(missedDays)}
              className="w-full"
              size="lg"
            >
              Start Recovery Session
            </Button>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-semibold mb-2">{goal.title}</h3>
              <p className="text-gray-600">{goal.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm">{goal.durationMinutes} minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-gray-500" />
                <span className={`text-sm font-medium ${getDifficultyColor(goal.difficultyLevel)}`}>
                  Difficulty {goal.difficultyLevel}/5
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium">Today's Focus:</h4>
              <div className="space-y-2">
                {goal.content.lesson?.keyPoints.slice(0, 3).map((point, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleStartGoal}
              className="w-full"
              size="lg"
              disabled={goal.isCompleted || !isGoalAvailable()}
            >
              {goal.isCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Completed
                </>
              ) : !isGoalAvailable() ? (
                <>
                  <Lock className="w-4 h-4 mr-2" />
                  Unlocks in {getDaysUntilAvailable()} days
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Today's Goal
                </>
              )}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );

  const renderLesson = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5" />
          Lesson: {goal.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800 mb-3">
            📹 Video lesson would play here in production
          </p>
          {goal.content.lesson?.videoUrl && (
            <div className="aspect-video bg-gray-200 rounded-lg flex items-center justify-center">
              <Play className="w-12 h-12 text-gray-400" />
            </div>
          )}
        </div>

        <div className="space-y-3">
          <h4 className="font-medium">Key Points:</h4>
          <ul className="space-y-2">
            {goal.content.lesson?.keyPoints.map((point, index) => (
              <li key={index} className="flex items-start gap-2">
                <Star className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{point}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentPhase('overview')}>
            Back
          </Button>
          <Button onClick={() => setCurrentPhase('practice')}>
            Continue to Practice
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderPractice = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Practice Exercises
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {goal.content.practice?.exercises.map((exercise, index) => (
          <div key={index} className="p-4 border rounded-lg">
            <h4 className="font-medium mb-2">Exercise {index + 1}</h4>
            <p className="text-sm text-gray-600 mb-3">{exercise.instructions}</p>
            <div className="p-3 bg-gray-50 rounded text-sm text-gray-500">
              {exercise.type === 'audio_comprehension' && '🎧 Audio would play here'}
              {exercise.type === 'note_completion' && '📝 Complete the notes while listening'}
              {exercise.type === 'skimming_practice' && '👀 Skim the passage and identify main topic'}
              {exercise.type === 'outline_creation' && '📋 Create an essay outline'}
              {exercise.type === 'cue_card_practice' && '🗣️ Practice speaking for 2 minutes'}
              {exercise.type === 'recovery_practice' && '🔄 Quick catch-up exercises'}
            </div>
            {exercise.timeLimit && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                <Timer className="w-3 h-3" />
                <span>Time limit: {exercise.timeLimit} minutes</span>
              </div>
            )}
          </div>
        ))}

        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setCurrentPhase('lesson')}>
            Back to Lesson
          </Button>
          <Button onClick={() => setCurrentPhase('assessment')}>
            Start Assessment
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const renderAssessment = () => (
    <div>
      <div className="mb-4">
        <Button variant="outline" onClick={() => setCurrentPhase('practice')}>
          ← Back to Practice
        </Button>
      </div>
      <MicroAssessment
        questions={goal.content.microAssessment.questions}
        timeLimit={goal.content.microAssessment.timeLimit}
        skillFocus={goal.skillFocus}
        onComplete={handleCompleteAssessment}
      />
    </div>
  );

  const renderCompleted = () => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-600">
          <CheckCircle className="w-5 h-5" />
          Goal Completed!
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {assessmentResults && (
          <div className="text-center space-y-4">
            <div className="text-3xl font-bold text-green-600">
              {assessmentResults.score}%
            </div>
            <div className="text-lg text-gray-600">
              Band {assessmentResults.bandEquivalent}
            </div>
            
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-green-800 font-medium mb-2">Great job! 🎉</p>
              <p className="text-green-700 text-sm">
                You've successfully completed today's {goal.skillFocus} goal.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="text-center">
                <div className="font-medium">Accuracy</div>
                <div className="text-green-600">{assessmentResults.score}%</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Time</div>
                <div className="text-blue-600">{goal.timeSpentMinutes || goal.durationMinutes} min</div>
              </div>
              <div className="text-center">
                <div className="font-medium">Level</div>
                <div className="text-purple-600">Band {assessmentResults.bandEquivalent}</div>
              </div>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 font-medium mb-2">Come back tomorrow for:</p>
              <p className="text-blue-700">
                Your next personalized goal based on today's performance
              </p>
            </div>
          </div>
        )}

        <Button 
          onClick={() => setCurrentPhase('overview')}
          className="w-full"
          variant="outline"
        >
          Back to Overview
        </Button>
      </CardContent>
    </Card>
  );

  switch (currentPhase) {
    case 'lesson': return renderLesson();
    case 'practice': return renderPractice();
    case 'assessment': return renderAssessment();
    case 'completed': return renderCompleted();
    default: return renderOverview();
  }
};

export default AdaptiveDailyGoalCard;
