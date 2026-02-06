import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, Clock, Target, TrendingUp, AlertCircle } from 'lucide-react';

interface Question {
  question: string;
  options?: string[];
  type: 'multiple_choice' | 'text' | 'speaking';
  correctAnswer: any;
  explanation?: string;
}

interface MicroAssessmentProps {
  questions: Question[];
  timeLimit: number; // in minutes
  skillFocus: string;
  onComplete: (results: AssessmentResults) => void;
}

interface AssessmentResults {
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent: number;
  bandEquivalent: number;
  feedback: {
    strengths: string[];
    improvements: string[];
    nextSteps: string[];
  };
}

const MicroAssessment: React.FC<MicroAssessmentProps> = ({
  questions,
  timeLimit,
  skillFocus,
  onComplete
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<any[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(timeLimit * 60); // Convert to seconds
  const [isCompleted, setIsCompleted] = useState(false);
  const [results, setResults] = useState<AssessmentResults | null>(null);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (timeRemaining > 0 && !isCompleted) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isCompleted) {
      handleSubmit();
    }
  }, [timeRemaining, isCompleted]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerChange = (answer: any) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = answer;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateBandEquivalent = (score: number): number => {
    // Convert percentage score to IELTS band score
    if (score >= 90) return 9.0;
    if (score >= 85) return 8.5;
    if (score >= 80) return 8.0;
    if (score >= 75) return 7.5;
    if (score >= 70) return 7.0;
    if (score >= 65) return 6.5;
    if (score >= 60) return 6.0;
    if (score >= 55) return 5.5;
    if (score >= 50) return 5.0;
    if (score >= 45) return 4.5;
    if (score >= 40) return 4.0;
    return 3.5;
  };

  const generateFeedback = (score: number, questionResults: boolean[]): AssessmentResults['feedback'] => {
    const strengths: string[] = [];
    const improvements: string[] = [];
    const nextSteps: string[] = [];

    if (score >= 70) {
      strengths.push(`Strong performance in ${skillFocus}`);
      strengths.push('Good understanding of key concepts');
      nextSteps.push('Ready for more advanced practice');
      nextSteps.push('Focus on timing and fluency');
    } else if (score >= 50) {
      strengths.push('Good foundation in place');
      improvements.push('Need more practice on core concepts');
      nextSteps.push('Review fundamental strategies');
      nextSteps.push('Practice with easier materials first');
    } else {
      improvements.push('Focus on building basic skills');
      improvements.push('Need more structured learning');
      nextSteps.push('Start with foundation materials');
      nextSteps.push('Consider additional support resources');
    }

    // Analyze specific question types
    const correctByType = questionResults.filter(Boolean).length;
    if (correctByType >= questionResults.length * 0.8) {
      strengths.push('Consistent performance across questions');
    } else if (correctByType <= questionResults.length * 0.4) {
      improvements.push('Struggled with multiple question types');
      nextSteps.push('Review question strategies');
    }

    return { strengths, improvements, nextSteps };
  };

  const handleSubmit = () => {
    const timeSpent = Math.round((Date.now() - startTime) / 1000 / 60); // in minutes
    const questionResults = questions.map((q, index) => {
      const userAnswer = answers[index];
      return JSON.stringify(userAnswer) === JSON.stringify(q.correctAnswer);
    });

    const correctAnswers = questionResults.filter(Boolean).length;
    const score = Math.round((correctAnswers / questions.length) * 100);
    const bandEquivalent = calculateBandEquivalent(score);
    const feedback = generateFeedback(score, questionResults);

    const assessmentResults: AssessmentResults = {
      score,
      totalQuestions: questions.length,
      correctAnswers,
      timeSpent,
      bandEquivalent,
      feedback
    };

    setResults(assessmentResults);
    setIsCompleted(true);
    onComplete(assessmentResults);
  };

  const renderQuestion = () => {
    const question = questions[currentQuestion];
    const currentAnswer = answers[currentQuestion];

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Question {currentQuestion + 1} of {questions.length}</span>
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4" />
              <span className={timeRemaining < 60 ? 'text-red-600' : ''}>
                {formatTime(timeRemaining)}
              </span>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline">{skillFocus}</Badge>
            <Progress value={((currentQuestion + 1) / questions.length) * 100} className="flex-1" />
          </div>

          <div>
            <h3 className="text-lg font-medium mb-4">{question.question}</h3>
            
            {question.type === 'multiple_choice' && question.options && (
              <RadioGroup
                value={currentAnswer?.toString()}
                onValueChange={(value) => handleAnswerChange(value)}
              >
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                    <Label htmlFor={`option-${index}`} className="flex-1">
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            )}

            {question.type === 'text' && (
              <Textarea
                value={currentAnswer || ''}
                onChange={(e) => handleAnswerChange(e.target.value)}
                placeholder="Type your answer here..."
                className="min-h-[100px]"
              />
            )}

            {question.type === 'speaking' && (
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    Record your response (in production, this would integrate with audio recording)
                  </p>
                </div>
                <Textarea
                  value={currentAnswer || ''}
                  onChange={(e) => handleAnswerChange(e.target.value)}
                  placeholder="Type your speaking response here..."
                  className="min-h-[120px]"
                />
              </div>
            )}
          </div>

          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={!currentAnswer && currentAnswer !== 0}
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  const renderResults = () => {
    if (!results) return null;

    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5" />
            Assessment Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {results.score}%
            </div>
            <div className="text-xl text-gray-600 mb-4">
              Band {results.bandEquivalent}
            </div>
            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <span>{results.correctAnswers}/{results.totalQuestions} correct</span>
              <span>•</span>
              <span>{results.timeSpent} minutes</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Strengths</span>
              </div>
              <ul className="text-sm text-green-700 space-y-1">
                {results.feedback.strengths.map((strength, index) => (
                  <li key={index}>• {strength}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">To Improve</span>
              </div>
              <ul className="text-sm text-yellow-700 space-y-1">
                {results.feedback.improvements.map((improvement, index) => (
                  <li key={index}>• {improvement}</li>
                ))}
              </ul>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="font-medium text-blue-800">Next Steps</span>
              </div>
              <ul className="text-sm text-blue-700 space-y-1">
                {results.feedback.nextSteps.map((step, index) => (
                  <li key={index}>• {step}</li>
                ))}
              </ul>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Question Review:</h4>
            {questions.map((question, index) => {
              const isCorrect = JSON.stringify(answers[index]) === JSON.stringify(question.correctAnswer);
              return (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center gap-3">
                    {isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className="text-sm">Question {index + 1}</span>
                  </div>
                  {!isCorrect && question.explanation && (
                    <span className="text-xs text-gray-600 max-w-md text-right">
                      {question.explanation}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {isCompleted ? renderResults() : renderQuestion()}
    </div>
  );
};

export default MicroAssessment;
