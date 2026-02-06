import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ChevronRight, ChevronLeft, Clock, Target, Calendar } from 'lucide-react';
import { getLegitimateListeningQuestions, getLegitimateReadingQuestions, getLegitimateWritingPrompt, getLegitimateSpeakingQuestions } from '@/lib/legitimateIELTSQuestions';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface DiagnosticData {
  targetBand: number;
  examDate: string;
  dailyStudyTime: number;
  currentLevel: {
    listening: number;
    reading: number;
    writing: number;
    speaking: number;
  };
  responses: {
    listening: number[];
    reading: number[];
    writing: string;
    speaking: {
      fluency: number;
      coherence: number;
      vocabulary: number;
      grammar: number;
    };
  };
}

const DiagnosticAssessment: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [diagnosticData, setDiagnosticData] = useState<DiagnosticData>({
    targetBand: 7.0,
    examDate: '',
    dailyStudyTime: 30,
    currentLevel: {
      listening: 5.0,
      reading: 5.0,
      writing: 5.0,
      speaking: 5.0,
    },
    responses: {
      listening: [],
      reading: [],
      writing: '',
      speaking: {
        fluency: 3,
        coherence: 3,
        vocabulary: 3,
        grammar: 3,
      },
    },
  });

  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const listeningQuestions = getLegitimateListeningQuestions('medium', 3);
  const readingQuestions = getLegitimateReadingQuestions('medium', 3);
  const writingPrompt = getLegitimateWritingPrompt('medium');
  const speakingQuestions = getLegitimateSpeakingQuestions(1, 3);

  const handleNext = async () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      await submitDiagnostic();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const calculatePacingMode = (examDate: string): 'INTENSIVE' | 'BALANCED' | 'STEADY_BUILD' => {
    const daysRemaining = Math.ceil((new Date(examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 45) return 'INTENSIVE';
    if (daysRemaining <= 90) return 'BALANCED';
    return 'STEADY_BUILD';
  };

  const calculateBandScore = (responses: DiagnosticData['responses']): { overall: number; components: typeof diagnosticData.currentLevel } => {
    // Simplified band score calculation
    const listeningScore = responses.listening.length > 0 ? 
      (responses.listening.filter((_, i) => i === 0 || i === 2).length / responses.listening.length) * 2 + 5 : 5.0;
    const readingScore = responses.reading.length > 0 ? 
      (responses.reading.filter((_, i) => i === 1 || i === 2).length / responses.reading.length) * 2 + 5 : 5.0;
    const writingScore = responses.writing.length > 100 ? 6.0 : responses.writing.length > 50 ? 5.5 : 5.0;
    const speakingScore = Object.values(responses.speaking).reduce((a, b) => a + b, 0) / Object.values(responses.speaking).length;

    const components = {
      listening: Math.min(9, Math.max(4, listeningScore)),
      reading: Math.min(9, Math.max(4, readingScore)),
      writing: Math.min(9, Math.max(4, writingScore)),
      speaking: Math.min(9, Math.max(4, speakingScore)),
    };

    const overall = Object.values(components).reduce((a, b) => a + b, 0) / 4;

    return { overall, components };
  };

  const submitDiagnostic = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { overall, components } = calculateBandScore(diagnosticData.responses);
      const pacingMode = calculatePacingMode(diagnosticData.examDate);
      
      // Save diagnostic assessment
      const { error: diagnosticError } = await supabase
        .from('diagnostic_assessments')
        .insert({
          user_id: user.id,
          assessment_data: diagnosticData,
          component_scores: components,
          overall_band_estimate: overall,
          weakest_areas: Object.entries(components)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 2)
            .map(([skill]) => skill),
          strongest_areas: Object.entries(components)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 2)
            .map(([skill]) => skill),
          recommendations: {
            pacing_mode: pacingMode,
            focus_areas: Object.entries(components)
              .sort(([, a], [, b]) => a - b)
              .slice(0, 2)
              .map(([skill]) => skill),
            daily_duration: diagnosticData.dailyStudyTime
          }
        });

      if (diagnosticError) throw diagnosticError;

      // Update user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          target_band_score: diagnosticData.targetBand,
          exam_date: diagnosticData.examDate,
          daily_study_time: diagnosticData.dailyStudyTime,
          pacing_mode: pacingMode,
          diagnostic_completed: true,
          diagnostic_score: components,
          onboarding_completed: true
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      // Update user progress
      const { error: progressError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          listening_level: Math.round(components.listening * 10),
          reading_level: Math.round(components.reading * 10),
          writing_level: Math.round(components.writing * 10),
          speaking_level: Math.round(components.speaking * 10),
          estimated_band: overall,
          skill_progress_details: {
            initial_assessment: components,
            focus_areas: Object.entries(components)
              .sort(([, a], [, b]) => a - b)
              .slice(0, 2)
              .map(([skill]) => skill)
          },
          focus_areas: Object.entries(components)
            .sort(([, a], [, b]) => a - b)
            .slice(0, 2)
            .map(([skill]) => skill)
        });

      if (progressError) throw progressError;

      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting diagnostic:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5" />
                Target Score & Timeline
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">What's your target IELTS band score?</Label>
                <RadioGroup
                  value={diagnosticData.targetBand.toString()}
                  onValueChange={(value) => setDiagnosticData(prev => ({ ...prev, targetBand: parseFloat(value) }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6.0" id="6.0" />
                    <Label htmlFor="6.0">6.0</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="6.5" id="6.5" />
                    <Label htmlFor="6.5">6.5</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7.0" id="7.0" />
                    <Label htmlFor="7.0">7.0</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="7.5" id="7.5" />
                    <Label htmlFor="7.5">7.5</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="8.0" id="8.0" />
                    <Label htmlFor="8.0">8.0</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <Label className="text-base font-medium">When is your exam date?</Label>
                <input
                  type="date"
                  value={diagnosticData.examDate}
                  onChange={(e) => setDiagnosticData(prev => ({ ...prev, examDate: e.target.value }))}
                  className="mt-2 w-full p-2 border rounded-md"
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <Label className="text-base font-medium">Daily study time commitment?</Label>
                <RadioGroup
                  value={diagnosticData.dailyStudyTime.toString()}
                  onValueChange={(value) => setDiagnosticData(prev => ({ ...prev, dailyStudyTime: parseInt(value) }))}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="15" id="15" />
                    <Label htmlFor="15">15 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="30" id="30" />
                    <Label htmlFor="30">30 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="45" id="45" />
                    <Label htmlFor="45">45 minutes</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="60" id="60" />
                    <Label htmlFor="60">60 minutes</Label>
                  </div>
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 1:
      case 2:
      case 3:
        const listeningQ = listeningQuestions[currentStep - 1];
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Listening Assessment - Question {currentStep}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="font-medium">Audio would play here in production</p>
                <p className="text-sm text-gray-600 mt-2">Question: {listeningQ.question}</p>
              </div>
              <RadioGroup
                value={diagnosticData.responses.listening[currentStep - 1]?.toString()}
                onValueChange={(value) => {
                  const newResponses = [...diagnosticData.responses.listening];
                  newResponses[currentStep - 1] = parseInt(value);
                  setDiagnosticData(prev => ({
                    ...prev,
                    responses: { ...prev.responses, listening: newResponses }
                  }));
                }}
              >
                {listeningQ.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`listening-${index}`} />
                    <Label htmlFor={`listening-${index}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        );

      case 4:
      case 5:
      case 6:
        const readingQ = readingQuestions[currentStep - 4];
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Reading Assessment - Question {currentStep - 3}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm leading-relaxed">{readingQ.passage}</p>
              </div>
              <div>
                <p className="font-medium mb-3">{readingQ.question}</p>
                <RadioGroup
                  value={diagnosticData.responses.reading[currentStep - 4]?.toString()}
                  onValueChange={(value) => {
                    const newResponses = [...diagnosticData.responses.reading];
                    newResponses[currentStep - 4] = parseInt(value);
                    setDiagnosticData(prev => ({
                      ...prev,
                      responses: { ...prev.responses, reading: newResponses }
                    }));
                  }}
                >
                  {readingQ.options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <RadioGroupItem value={index.toString()} id={`reading-${index}`} />
                      <Label htmlFor={`reading-${index}`}>{option}</Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            </CardContent>
          </Card>
        );

      case 7:
        return (
          <Card>
            <CardHeader>
              <CardTitle>Writing Sample</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="font-medium mb-2">Writing Task 2 Sample Prompt:</p>
                <p>"Some people believe that technology has made our lives more complex, while others argue that it has simplified our existence. Discuss both views and give your own opinion."</p>
              </div>
              <div>
                <Label className="text-base font-medium">Write a brief response (2-3 sentences)</Label>
                <Textarea
                  value={diagnosticData.responses.writing}
                  onChange={(e) => setDiagnosticData(prev => ({
                    ...prev,
                    responses: { ...prev.responses, writing: e.target.value }
                  }))}
                  placeholder="Type your response here..."
                  className="mt-2 min-h-[100px]"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-base font-medium">Self-assessment (Speaking skills)</Label>
                {Object.entries(diagnosticData.responses.speaking).map(([skill, value]) => (
                  <div key={skill}>
                    <Label className="capitalize">{skill} (1-5)</Label>
                    <RadioGroup
                      value={value.toString()}
                      onValueChange={(newValue) => {
                        setDiagnosticData(prev => ({
                          ...prev,
                          responses: {
                            ...prev.responses,
                            speaking: {
                              ...prev.responses.speaking,
                              [skill]: parseInt(newValue)
                            }
                          }
                        }));
                      }}
                      className="flex gap-4"
                    >
                      {[1, 2, 3, 4, 5].map(num => (
                        <div key={num} className="flex items-center space-x-1">
                          <RadioGroupItem value={num.toString} id={`${skill}-${num}`} />
                          <Label htmlFor={`${skill}-${num}`}>{num}</Label>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center mb-2">IELTS Diagnostic Assessment</h1>
          <p className="text-center text-gray-600">
            Let's assess your current level to create a personalized study plan
          </p>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>Step {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {renderStep()}

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Previous
          </Button>
          <Button
            onClick={handleNext}
            disabled={loading || (currentStep === 0 && (!diagnosticData.examDate || !diagnosticData.targetBand))}
          >
            {loading ? 'Submitting...' : currentStep === totalSteps - 1 ? 'Complete Assessment' : 'Next'}
            {currentStep < totalSteps - 1 && <ChevronRight className="w-4 h-4 ml-2" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticAssessment;
