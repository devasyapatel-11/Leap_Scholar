import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpen, ArrowLeft, ArrowRight, Play, CheckCircle, Clock, 
  Headphones, PenLine, Mic, Sparkles, Loader2, Trophy, Home
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface DailyGoal {
  id: number;
  day_number: number;
  title: string;
  description: string | null;
  skill_focus: string;
  duration_minutes: number;
  content: { video_duration?: number; practice_questions?: number } | null;
}

interface Question {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

const SAMPLE_QUESTIONS: Record<string, Question[]> = {
  listening: [
    { id: 1, question: "In IELTS Listening, how many sections are there?", options: ["2", "3", "4", "5"], correctAnswer: 2, explanation: "IELTS Listening has 4 sections with increasing difficulty." },
    { id: 2, question: "How long is the IELTS Listening test?", options: ["20 minutes", "30 minutes", "40 minutes", "60 minutes"], correctAnswer: 1, explanation: "The listening test is approximately 30 minutes plus 10 minutes transfer time." },
    { id: 3, question: "Can you hear the recording more than once?", options: ["Yes, twice", "Yes, three times", "No, only once", "Depends on the section"], correctAnswer: 2, explanation: "In IELTS, you only hear each recording once, so concentration is key." },
    { id: 4, question: "What should you do during the example at the start?", options: ["Relax completely", "Read ahead to the questions", "Close your eyes", "Write notes"], correctAnswer: 1, explanation: "Use the example time to read ahead and predict answers." },
    { id: 5, question: "How are marks calculated in Listening?", options: ["Partial marks given", "One mark per correct answer", "Weighted by section", "Based on difficulty"], correctAnswer: 1, explanation: "Each correct answer equals one mark, with no negative marking." },
  ],
  reading: [
    { id: 1, question: "How long is the IELTS Academic Reading test?", options: ["30 minutes", "45 minutes", "60 minutes", "90 minutes"], correctAnswer: 2, explanation: "You have 60 minutes to complete 40 questions in Reading." },
    { id: 2, question: "How many passages are in Academic Reading?", options: ["2", "3", "4", "5"], correctAnswer: 1, explanation: "There are 3 reading passages in the Academic test." },
    { id: 3, question: "What is 'skimming' in reading?", options: ["Reading every word", "Reading quickly for main ideas", "Reading backwards", "Reading only headings"], correctAnswer: 1, explanation: "Skimming means quickly reading for the main idea and overall structure." },
    { id: 4, question: "For True/False/Not Given, 'Not Given' means:", options: ["The statement is false", "There's no information about this", "You need to guess", "The passage contradicts it"], correctAnswer: 1, explanation: "'Not Given' means the passage doesn't contain information to confirm or deny the statement." },
    { id: 5, question: "Should you read the passage or questions first?", options: ["Always the passage", "Always the questions", "It depends on your strategy", "Neither, guess first"], correctAnswer: 2, explanation: "Different strategies work for different people - find what works best for you." },
  ],
  writing: [
    { id: 1, question: "How long should you spend on Task 1?", options: ["10 minutes", "20 minutes", "30 minutes", "40 minutes"], correctAnswer: 1, explanation: "Spend about 20 minutes on Task 1 as it's worth fewer marks than Task 2." },
    { id: 2, question: "What is the minimum word count for Task 2?", options: ["150 words", "200 words", "250 words", "300 words"], correctAnswer: 2, explanation: "Task 2 requires at least 250 words; writing less will lose marks." },
    { id: 3, question: "Which task is worth more marks?", options: ["Task 1", "Task 2", "They're equal", "Depends on quality"], correctAnswer: 1, explanation: "Task 2 is worth twice as much as Task 1, so prioritize it." },
    { id: 4, question: "What does 'coherence' refer to?", options: ["Grammar accuracy", "Logical flow of ideas", "Vocabulary range", "Spelling"], correctAnswer: 1, explanation: "Coherence refers to how logically your ideas connect and flow." },
    { id: 5, question: "Should you give your opinion in Task 2?", options: ["Never", "Only if asked", "Always", "Only in conclusion"], correctAnswer: 1, explanation: "Only give your opinion when the question specifically asks for it." },
  ],
  speaking: [
    { id: 1, question: "How long is the Speaking test?", options: ["5-8 minutes", "11-14 minutes", "20-25 minutes", "30 minutes"], correctAnswer: 1, explanation: "The Speaking test lasts between 11-14 minutes." },
    { id: 2, question: "In Part 2, how long do you speak?", options: ["30 seconds", "1 minute", "1-2 minutes", "3-4 minutes"], correctAnswer: 2, explanation: "You must speak for 1-2 minutes in Part 2 based on a cue card." },
    { id: 3, question: "Can you ask the examiner to repeat a question?", options: ["No, never", "Yes, in any part", "Only in Part 1 and 3", "Only once"], correctAnswer: 2, explanation: "You can ask for clarification in Parts 1 and 3, but not in Part 2." },
    { id: 4, question: "What is assessed in Speaking?", options: ["Only grammar", "Only pronunciation", "Fluency, vocabulary, grammar, pronunciation", "Only ideas"], correctAnswer: 2, explanation: "You're assessed on fluency/coherence, vocabulary, grammar, and pronunciation." },
    { id: 5, question: "Is it okay to pause briefly while speaking?", options: ["No, never pause", "Yes, natural pauses are fine", "Only at the end", "Only in Part 2"], correctAnswer: 1, explanation: "Natural pauses are fine and show you're thinking - just don't pause too long." },
  ],
  mixed: [
    { id: 1, question: "What is the highest IELTS band score?", options: ["8", "9", "10", "12"], correctAnswer: 1, explanation: "The IELTS scoring scale goes from 1 to 9." },
    { id: 2, question: "How long are IELTS scores valid?", options: ["6 months", "1 year", "2 years", "5 years"], correctAnswer: 2, explanation: "IELTS scores are typically valid for 2 years." },
    { id: 3, question: "Which skill often needs the most practice?", options: ["The one you're best at", "The one you struggle with most", "All equally", "Only writing"], correctAnswer: 1, explanation: "Focus extra practice on your weakest areas to improve overall band score." },
    { id: 4, question: "What's the best way to improve vocabulary?", options: ["Memorize dictionary", "Read widely and note new words", "Only study word lists", "Ignore it"], correctAnswer: 1, explanation: "Reading extensively and learning words in context is most effective." },
    { id: 5, question: "How often should you practice?", options: ["Once a week", "Only before the test", "Daily, even briefly", "Twice a month"], correctAnswer: 2, explanation: "Consistent daily practice, even for short periods, is most effective." },
  ],
};

const skillIcons: Record<string, typeof Headphones> = {
  listening: Headphones,
  reading: BookOpen,
  writing: PenLine,
  speaking: Mic,
  mixed: Sparkles,
};

export default function GoalLesson() {
  const { dayNumber } = useParams<{ dayNumber: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [goal, setGoal] = useState<DailyGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(0); // 0: video, 1: practice, 2: assessment, 3: results
  const [videoCompleted, setVideoCompleted] = useState(false);
  const [practiceAnswers, setPracticeAnswers] = useState<Record<number, number>>({});
  const [assessmentAnswers, setAssessmentAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    async function fetchGoal() {
      if (!dayNumber) return;
      
      const { data } = await supabase
        .from('daily_goals')
        .select('*')
        .eq('day_number', parseInt(dayNumber))
        .maybeSingle();
      
      if (data) {
        setGoal(data as DailyGoal);
      }
      setLoading(false);
    }
    fetchGoal();
  }, [dayNumber]);

  const questions = goal ? SAMPLE_QUESTIONS[goal.skill_focus] || SAMPLE_QUESTIONS.mixed : [];
  const practiceQuestions = questions.slice(0, 3);
  const assessmentQuestions = questions.slice(2, 5);

  const calculateScore = () => {
    let correct = 0;
    assessmentQuestions.forEach((q, idx) => {
      if (assessmentAnswers[idx] === q.correctAnswer) correct++;
    });
    return Math.round((correct / assessmentQuestions.length) * 100);
  };

  const handleCompleteGoal = async () => {
    if (!user || !goal) return;
    setIsSubmitting(true);

    const finalScore = calculateScore();
    setScore(finalScore);

    // Save completion
    await supabase.from('goal_completions').upsert({
      user_id: user.id,
      goal_id: goal.id,
      score: finalScore,
      time_spent_minutes: goal.duration_minutes,
    }, { onConflict: 'user_id,goal_id' });

    // Update streak
    const today = new Date().toISOString().split('T')[0];
    const { data: streakData } = await supabase
      .from('user_streaks')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (streakData) {
      const lastActivity = streakData.last_activity_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      let newStreak = 1;
      if (lastActivity === yesterday) {
        newStreak = (streakData.current_streak || 0) + 1;
      } else if (lastActivity === today) {
        newStreak = streakData.current_streak || 1;
      }

      await supabase.from('user_streaks').update({
        current_streak: newStreak,
        longest_streak: Math.max(newStreak, streakData.longest_streak || 0),
        last_activity_date: today,
      }).eq('user_id', user.id);
    }

    // Update progress based on score
    const progressIncrease = Math.round((finalScore / 100) * 10);
    const skillField = `${goal.skill_focus}_level` as const;
    
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (progressData && goal.skill_focus !== 'mixed') {
      const currentLevel = (progressData as any)[skillField] || 50;
      const newLevel = Math.min(100, currentLevel + progressIncrease);
      
      await supabase.from('user_progress').update({
        [skillField]: newLevel,
        estimated_band: Math.round(((newLevel + (progressData.listening_level || 50) + (progressData.reading_level || 50) + (progressData.writing_level || 50) + (progressData.speaking_level || 50)) / 500 * 4 + 4) * 2) / 2,
      }).eq('user_id', user.id);
    }

    setShowResults(true);
    setIsSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground mb-4">Goal not found.</p>
            <Button onClick={() => navigate('/dashboard')}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const SkillIcon = skillIcons[goal.skill_focus] || Sparkles;
  const steps = ['Video Lesson', 'Practice', 'Assessment'];
  const progress = ((currentStep + 1) / (steps.length + 1)) * 100;

  if (showResults) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-semibold text-foreground">LeapScholar</span>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-12">
          <div className="max-w-lg mx-auto text-center">
            <div className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center mx-auto mb-6">
              <Trophy className="w-10 h-10 text-success" />
            </div>
            
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Day {goal.day_number} Complete! 🎉
            </h1>
            <p className="text-muted-foreground mb-8">
              Great job finishing today's goal!
            </p>

            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="text-4xl font-bold text-primary mb-2">{score}%</div>
                <p className="text-muted-foreground">Assessment Score</p>
                
                <div className="mt-4 pt-4 border-t space-y-2">
                  {assessmentQuestions.map((q, idx) => (
                    <div key={q.id} className="flex items-center gap-2 text-sm">
                      {assessmentAnswers[idx] === q.correctAnswer ? (
                        <CheckCircle className="w-4 h-4 text-success" />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-destructive/20 flex items-center justify-center text-destructive text-xs">✗</div>
                      )}
                      <span className={assessmentAnswers[idx] === q.correctAnswer ? 'text-foreground' : 'text-muted-foreground'}>
                        Q{idx + 1}: {assessmentAnswers[idx] === q.correctAnswer ? 'Correct' : q.explanation}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {goal.day_number < 28 && (
              <Card className="mb-6 bg-primary/5 border-primary/20">
                <CardContent className="pt-6">
                  <p className="text-sm text-muted-foreground mb-1">Tomorrow's Goal</p>
                  <p className="font-semibold">Day {goal.day_number + 1}</p>
                </CardContent>
              </Card>
            )}

            <Button size="lg" onClick={() => navigate('/dashboard')} className="gap-2">
              <Home className="w-4 h-4" /> Back to Dashboard
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <p className="text-sm text-muted-foreground">Day {goal.day_number} of 28</p>
                <h1 className="font-semibold text-foreground">{goal.title}</h1>
              </div>
            </div>
            <Badge variant="outline" className="gap-1">
              <Clock className="w-3 h-3" />
              {goal.duration_minutes} min
            </Badge>
          </div>
        </div>
      </header>

      {/* Progress steps */}
      <div className="container mx-auto px-4 py-4 border-b">
        <div className="flex items-center justify-between mb-2">
          {steps.map((step, idx) => (
            <div key={step} className={cn(
              'flex items-center gap-2',
              idx <= currentStep ? 'text-primary' : 'text-muted-foreground'
            )}>
              <div className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                idx < currentStep && 'bg-primary text-primary-foreground',
                idx === currentStep && 'bg-primary text-primary-foreground',
                idx > currentStep && 'bg-muted'
              )}>
                {idx < currentStep ? <CheckCircle className="w-4 h-4" /> : idx + 1}
              </div>
              <span className="hidden sm:inline text-sm">{step}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 0: Video Lesson */}
          {currentStep === 0 && (
            <div className="animate-fade-up">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Play className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle>Video Lesson</CardTitle>
                      <CardDescription>{goal.content?.video_duration || 10} minutes</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Video placeholder */}
                  <div className="aspect-video bg-muted rounded-lg flex items-center justify-center mb-6">
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto mb-3">
                        <Play className="w-8 h-8 text-primary" />
                      </div>
                      <p className="text-muted-foreground">Video: {goal.title}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        (Placeholder - imagine a {goal.content?.video_duration || 10} min lesson here)
                      </p>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-4 mb-6">
                    <h4 className="font-medium mb-2">Key Points:</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>• Understanding the {goal.skill_focus} section format</li>
                      <li>• Common question types and strategies</li>
                      <li>• Time management tips</li>
                      <li>• Avoiding common mistakes</li>
                    </ul>
                  </div>

                  <Button 
                    className="w-full" 
                    onClick={() => { setVideoCompleted(true); setCurrentStep(1); }}
                  >
                    Mark Complete & Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 1: Practice */}
          {currentStep === 1 && (
            <div className="animate-fade-up">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                      <SkillIcon className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <CardTitle>Practice Exercise</CardTitle>
                      <CardDescription>Apply what you learned</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {practiceQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 border rounded-lg">
                      <p className="font-medium mb-3">Q{idx + 1}. {q.question}</p>
                      <RadioGroup 
                        value={practiceAnswers[idx]?.toString()} 
                        onValueChange={(val) => setPracticeAnswers(prev => ({ ...prev, [idx]: parseInt(val) }))}
                      >
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <RadioGroupItem value={optIdx.toString()} id={`practice-${idx}-${optIdx}`} />
                            <Label htmlFor={`practice-${idx}-${optIdx}`}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                      {practiceAnswers[idx] !== undefined && (
                        <div className={cn(
                          'mt-3 p-2 rounded text-sm',
                          practiceAnswers[idx] === q.correctAnswer ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                        )}>
                          {practiceAnswers[idx] === q.correctAnswer ? '✓ Correct!' : `Hint: ${q.explanation}`}
                        </div>
                      )}
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(0)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={() => setCurrentStep(2)}
                      disabled={Object.keys(practiceAnswers).length < practiceQuestions.length}
                    >
                      Continue to Assessment <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Assessment */}
          {currentStep === 2 && (
            <div className="animate-fade-up">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-warning" />
                    </div>
                    <div>
                      <CardTitle>Micro-Assessment</CardTitle>
                      <CardDescription>Test your understanding</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {assessmentQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 border rounded-lg">
                      <p className="font-medium mb-3">Q{idx + 1}. {q.question}</p>
                      <RadioGroup 
                        value={assessmentAnswers[idx]?.toString()} 
                        onValueChange={(val) => setAssessmentAnswers(prev => ({ ...prev, [idx]: parseInt(val) }))}
                      >
                        {q.options.map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center space-x-2">
                            <RadioGroupItem value={optIdx.toString()} id={`assess-${idx}-${optIdx}`} />
                            <Label htmlFor={`assess-${idx}-${optIdx}`}>{opt}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>
                  ))}

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setCurrentStep(1)}>
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                    <Button 
                      className="flex-1"
                      onClick={handleCompleteGoal}
                      disabled={Object.keys(assessmentAnswers).length < assessmentQuestions.length || isSubmitting}
                    >
                      {isSubmitting ? (
                        <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
                      ) : (
                        <>Complete Day {goal.day_number} <CheckCircle className="w-4 h-4 ml-2" /></>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
