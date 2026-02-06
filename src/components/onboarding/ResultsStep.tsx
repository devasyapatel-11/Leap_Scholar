 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { ArrowLeft, ArrowRight, Loader2, Headphones, BookOpen, PenLine, Mic, Target } from 'lucide-react';
 import { OnboardingData } from '@/pages/Onboarding';
 
 interface ResultsStepProps {
   data: OnboardingData;
   isSubmitting: boolean;
   onComplete: () => void;
   onBack: () => void;
 }
 
 export function ResultsStep({ data, isSubmitting, onComplete, onBack }: ResultsStepProps) {
   const levelToBand = (level: number) => {
     return Math.round((level / 100 * 4 + 4) * 2) / 2;
   };
 
   const skills = [
     { name: 'Listening', level: data.listeningLevel, icon: Headphones, color: 'bg-chart-listening' },
     { name: 'Reading', level: data.readingLevel, icon: BookOpen, color: 'bg-chart-reading' },
     { name: 'Writing', level: data.writingConfidence, icon: PenLine, color: 'bg-chart-writing' },
     { name: 'Speaking', level: data.speakingConfidence, icon: Mic, color: 'bg-chart-speaking' },
   ];
 
   const avgLevel = (data.listeningLevel + data.readingLevel + data.writingConfidence + data.speakingConfidence) / 4;
   const estimatedBand = levelToBand(avgLevel);
   const gap = data.targetBand - estimatedBand;
 
   return (
     <div>
       <h1 className="text-2xl font-bold text-foreground mb-2">
         Your Assessment Results
       </h1>
       <p className="text-muted-foreground mb-6">
         Based on your responses, here's where you stand.
       </p>
 
       {/* Overall Score Card */}
       <Card className="mb-6 border-2 border-primary">
         <CardContent className="pt-6">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-sm text-muted-foreground mb-1">Estimated Current Band</p>
               <p className="text-4xl font-bold text-primary">{estimatedBand.toFixed(1)}</p>
             </div>
             <div className="text-right">
               <p className="text-sm text-muted-foreground mb-1">Your Target</p>
               <p className="text-4xl font-bold text-foreground">{data.targetBand.toFixed(1)}</p>
             </div>
           </div>
           
           {gap > 0 && (
             <div className="mt-4 p-3 bg-warning/10 rounded-lg">
               <div className="flex items-center gap-2 text-warning">
                 <Target className="w-4 h-4" />
                 <span className="text-sm font-medium">
                   Gap to close: {gap.toFixed(1)} bands
                 </span>
               </div>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Skills Breakdown */}
       <Card className="mb-6">
         <CardHeader>
           <CardTitle className="text-lg">Skills Breakdown</CardTitle>
         </CardHeader>
         <CardContent className="space-y-4">
           {skills.map(skill => (
             <div key={skill.name}>
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <skill.icon className="w-4 h-4 text-muted-foreground" />
                   <span className="font-medium">{skill.name}</span>
                 </div>
                 <span className="text-sm font-semibold">
                   Band {levelToBand(skill.level).toFixed(1)}
                 </span>
               </div>
               <Progress 
                 value={skill.level} 
                 className="h-2"
               />
             </div>
           ))}
         </CardContent>
       </Card>
 
       {/* Plan Summary */}
       <Card className="bg-primary/5 border-primary/20 mb-8">
         <CardContent className="pt-6">
           <h3 className="font-semibold mb-2">Your Personalized Plan</h3>
           <ul className="text-sm text-muted-foreground space-y-1">
             <li>• 28-day structured study program</li>
             <li>• {data.dailyTime} minutes of focused practice daily</li>
             <li>• Emphasis on skills that need the most improvement</li>
             <li>• Progress tracking and adaptive adjustments</li>
           </ul>
         </CardContent>
       </Card>
 
       <div className="flex justify-between">
         <Button variant="ghost" onClick={onBack} className="gap-2" disabled={isSubmitting}>
           <ArrowLeft className="w-4 h-4" /> Back
         </Button>
         <Button onClick={onComplete} size="lg" className="gap-2" disabled={isSubmitting}>
           {isSubmitting ? (
             <>
               <Loader2 className="w-4 h-4 animate-spin" />
               Creating your plan...
             </>
           ) : (
             <>
               Start My Journey <ArrowRight className="w-4 h-4" />
             </>
           )}
         </Button>
       </div>
     </div>
   );
 }