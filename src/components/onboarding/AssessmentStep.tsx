 import { useState } from 'react';
 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
 import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
 import { Label } from '@/components/ui/label';
 import { Slider } from '@/components/ui/slider';
 import { ArrowLeft, ArrowRight, Headphones, BookOpen, PenLine, Mic } from 'lucide-react';
 import { OnboardingData } from '@/pages/Onboarding';
 
 interface AssessmentStepProps {
   data: OnboardingData;
   updateData: (updates: Partial<OnboardingData>) => void;
   onNext: () => void;
   onBack: () => void;
 }
 
 const LISTENING_QUESTION = {
   passage: "In this recording, a university professor discusses the impact of climate change on coastal ecosystems. The speaker mentions that sea levels have risen by approximately 8 inches since 1880.",
   question: "According to the passage, how much have sea levels risen since 1880?",
   options: [
     { value: "25", label: "6 inches" },
     { value: "50", label: "8 inches" },
     { value: "75", label: "10 inches" },
     { value: "100", label: "12 inches" },
   ],
 };
 
 const READING_QUESTION = {
   passage: `The phenomenon of urban heat islands occurs when cities replace natural land cover with dense concentrations of pavement, buildings, and other surfaces that absorb and retain heat. This effect causes urban regions to experience higher temperatures than their rural surroundings, with the temperature difference often reaching 5-7°F during the day and as much as 22°F at night.`,
   question: "What causes urban heat islands?",
   options: [
     { value: "25", label: "Global warming effects on cities" },
     { value: "50", label: "Industrial pollution in urban areas" },
     { value: "75", label: "Replacement of natural land with heat-absorbing surfaces" },
     { value: "100", label: "Increased population density" },
   ],
 };
 
 export function AssessmentStep({ data, updateData, onNext, onBack }: AssessmentStepProps) {
   const [listeningAnswer, setListeningAnswer] = useState<string>('');
   const [readingAnswer, setReadingAnswer] = useState<string>('');
 
   const handleListeningChange = (value: string) => {
     setListeningAnswer(value);
     updateData({ listeningLevel: parseInt(value) });
   };
 
   const handleReadingChange = (value: string) => {
     setReadingAnswer(value);
     updateData({ readingLevel: parseInt(value) });
   };
 
   return (
     <div>
       <h1 className="text-2xl font-bold text-foreground mb-2">
         Quick Assessment
       </h1>
       <p className="text-muted-foreground mb-6">
         Answer a few questions so we can gauge your current level.
       </p>
 
       <div className="space-y-6">
         {/* Listening Question */}
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-chart-listening/10 flex items-center justify-center">
                 <Headphones className="w-4 h-4 text-chart-listening" />
               </div>
               <CardTitle className="text-lg">Listening</CardTitle>
             </div>
             <CardDescription className="mt-2 p-3 bg-muted rounded-lg text-sm italic">
               "{LISTENING_QUESTION.passage}"
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="font-medium mb-3">{LISTENING_QUESTION.question}</p>
             <RadioGroup value={listeningAnswer} onValueChange={handleListeningChange}>
               {LISTENING_QUESTION.options.map(option => (
                 <div key={option.value} className="flex items-center space-x-2">
                   <RadioGroupItem value={option.value} id={`listening-${option.value}`} />
                   <Label htmlFor={`listening-${option.value}`}>{option.label}</Label>
                 </div>
               ))}
             </RadioGroup>
           </CardContent>
         </Card>
 
         {/* Reading Question */}
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-chart-reading/10 flex items-center justify-center">
                 <BookOpen className="w-4 h-4 text-chart-reading" />
               </div>
               <CardTitle className="text-lg">Reading</CardTitle>
             </div>
             <CardDescription className="mt-2 p-3 bg-muted rounded-lg text-sm">
               {READING_QUESTION.passage}
             </CardDescription>
           </CardHeader>
           <CardContent>
             <p className="font-medium mb-3">{READING_QUESTION.question}</p>
             <RadioGroup value={readingAnswer} onValueChange={handleReadingChange}>
               {READING_QUESTION.options.map(option => (
                 <div key={option.value} className="flex items-center space-x-2">
                   <RadioGroupItem value={option.value} id={`reading-${option.value}`} />
                   <Label htmlFor={`reading-${option.value}`}>{option.label}</Label>
                 </div>
               ))}
             </RadioGroup>
           </CardContent>
         </Card>
 
         {/* Writing Confidence */}
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-chart-writing/10 flex items-center justify-center">
                 <PenLine className="w-4 h-4 text-chart-writing" />
               </div>
               <CardTitle className="text-lg">Writing Confidence</CardTitle>
             </div>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
               How confident are you in your academic writing skills?
             </p>
             <Slider
               value={[data.writingConfidence]}
               onValueChange={([value]) => updateData({ writingConfidence: value })}
               max={100}
               step={10}
               className="mb-2"
             />
             <div className="flex justify-between text-xs text-muted-foreground">
               <span>Beginner</span>
               <span>Intermediate</span>
               <span>Advanced</span>
             </div>
           </CardContent>
         </Card>
 
         {/* Speaking Confidence */}
         <Card>
           <CardHeader className="pb-3">
             <div className="flex items-center gap-2">
               <div className="w-8 h-8 rounded-lg bg-chart-speaking/10 flex items-center justify-center">
                 <Mic className="w-4 h-4 text-chart-speaking" />
               </div>
               <CardTitle className="text-lg">Speaking Confidence</CardTitle>
             </div>
           </CardHeader>
           <CardContent>
             <p className="text-sm text-muted-foreground mb-4">
               How confident are you in speaking English fluently?
             </p>
             <Slider
               value={[data.speakingConfidence]}
               onValueChange={([value]) => updateData({ speakingConfidence: value })}
               max={100}
               step={10}
               className="mb-2"
             />
             <div className="flex justify-between text-xs text-muted-foreground">
               <span>Beginner</span>
               <span>Intermediate</span>
               <span>Advanced</span>
             </div>
           </CardContent>
         </Card>
       </div>
 
       <div className="flex justify-between mt-8">
         <Button variant="ghost" onClick={onBack} className="gap-2">
           <ArrowLeft className="w-4 h-4" /> Back
         </Button>
         <Button onClick={onNext} className="gap-2">
           Continue <ArrowRight className="w-4 h-4" />
         </Button>
       </div>
     </div>
   );
 }