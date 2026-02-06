import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Target, Clock, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Step components
import { WelcomeStep } from '@/components/onboarding/WelcomeStep';
import { PersonalInfoStep } from '@/components/onboarding/PersonalInfoStep';
import { AssessmentStep } from '@/components/onboarding/AssessmentStep';
import { CommitmentStep } from '@/components/onboarding/CommitmentStep';
import { ResultsStep } from '@/components/onboarding/ResultsStep';

const STEPS = [
  { id: 'welcome', title: 'Welcome', icon: BookOpen },
  { id: 'personal', title: 'Your Goals', icon: Target },
  { id: 'assessment', title: 'Assessment', icon: CheckCircle },
  { id: 'commitment', title: 'Commitment', icon: Clock },
  { id: 'results', title: 'Results', icon: CheckCircle },
];

export interface OnboardingData {
  targetBand: number;
  examDate: Date | null;
  listeningLevel: number;
  readingLevel: number;
  writingConfidence: number;
  speakingConfidence: number;
  dailyTime: number;
}

export default function Onboarding() {
  const navigate = useNavigate();
  const { updateProfile, updateProgress } = useProfile();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    targetBand: 7.0,
    examDate: null,
    listeningLevel: 50,
    readingLevel: 50,
    writingConfidence: 50,
    speakingConfidence: 50,
    dailyTime: 30,
  });

  const updateData = (updates: Partial<OnboardingData>) => {
    setData(prev => ({ ...prev, ...updates }));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);

    // Calculate estimated band from assessment
    const avgLevel = (data.listeningLevel + data.readingLevel + data.writingConfidence + data.speakingConfidence) / 4;
    const estimatedBand = Math.round((avgLevel / 100 * 4 + 4) * 2) / 2; // Maps 0-100 to 4-8 band

    await Promise.all([
      updateProfile({
        target_band_score: data.targetBand,
        exam_date: data.examDate?.toISOString().split('T')[0] || null,
        daily_study_time: data.dailyTime,
        onboarding_completed: true,
      }),
      updateProgress({
        listening_level: data.listeningLevel,
        reading_level: data.readingLevel,
        writing_level: data.writingConfidence,
        speaking_level: data.speakingConfidence,
        estimated_band: estimatedBand,
      }),
    ]);

    navigate('/dashboard');
  };

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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

      {/* Progress bar */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            {STEPS.map((step, index) => (
              <div 
                key={step.id}
                className={cn(
                  'flex items-center gap-2',
                  index <= currentStep ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                <div className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index < currentStep && 'bg-primary text-primary-foreground',
                  index === currentStep && 'bg-primary text-primary-foreground',
                  index > currentStep && 'bg-muted text-muted-foreground'
                )}>
                  {index < currentStep ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                <span className="hidden sm:inline text-sm font-medium">{step.title}</span>
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto animate-fade-up">
          {currentStep === 0 && (
            <WelcomeStep onNext={() => setCurrentStep(1)} />
          )}
          {currentStep === 1 && (
            <PersonalInfoStep 
              data={data} 
              updateData={updateData}
              onNext={() => setCurrentStep(2)}
              onBack={() => setCurrentStep(0)}
            />
          )}
          {currentStep === 2 && (
            <AssessmentStep 
              data={data} 
              updateData={updateData}
              onNext={() => setCurrentStep(3)}
              onBack={() => setCurrentStep(1)}
            />
          )}
          {currentStep === 3 && (
            <CommitmentStep 
              data={data} 
              updateData={updateData}
              onNext={() => setCurrentStep(4)}
              onBack={() => setCurrentStep(2)}
            />
          )}
          {currentStep === 4 && (
            <ResultsStep 
              data={data}
              isSubmitting={isSubmitting}
              onComplete={handleComplete}
              onBack={() => setCurrentStep(3)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
