 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Label } from '@/components/ui/label';
 import { Calendar } from '@/components/ui/calendar';
 import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
 import { ArrowLeft, ArrowRight, CalendarIcon } from 'lucide-react';
 import { format, differenceInDays } from 'date-fns';
 import { cn } from '@/lib/utils';
 import { OnboardingData } from '@/pages/Onboarding';
 
 interface PersonalInfoStepProps {
   data: OnboardingData;
   updateData: (updates: Partial<OnboardingData>) => void;
   onNext: () => void;
   onBack: () => void;
 }
 
 const BAND_SCORES = [5.0, 5.5, 6.0, 6.5, 7.0, 7.5, 8.0, 8.5, 9.0];
 
 export function PersonalInfoStep({ data, updateData, onNext, onBack }: PersonalInfoStepProps) {
   const daysUntilExam = data.examDate 
     ? differenceInDays(data.examDate, new Date()) 
     : null;
 
   return (
     <div>
       <h1 className="text-2xl font-bold text-foreground mb-2">
         Set Your Goals
       </h1>
       <p className="text-muted-foreground mb-6">
         Tell us about your IELTS target so we can customize your plan.
       </p>
 
       <div className="space-y-6">
         {/* Target Band Score */}
         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-lg">Target Band Score</CardTitle>
           </CardHeader>
           <CardContent>
             <div className="flex flex-wrap gap-2">
               {BAND_SCORES.map(score => (
                 <Button
                   key={score}
                   variant={data.targetBand === score ? 'default' : 'outline'}
                   size="lg"
                   onClick={() => updateData({ targetBand: score })}
                   className="min-w-[60px]"
                 >
                   {score.toFixed(1)}
                 </Button>
               ))}
             </div>
           </CardContent>
         </Card>
 
         {/* Exam Date */}
         <Card>
           <CardHeader className="pb-3">
             <CardTitle className="text-lg">Exam Date (Optional)</CardTitle>
           </CardHeader>
           <CardContent>
             <Popover>
               <PopoverTrigger asChild>
                 <Button
                   variant="outline"
                   className={cn(
                     'w-full justify-start text-left font-normal',
                     !data.examDate && 'text-muted-foreground'
                   )}
                 >
                   <CalendarIcon className="mr-2 h-4 w-4" />
                   {data.examDate ? format(data.examDate, 'PPP') : 'Select your exam date'}
                 </Button>
               </PopoverTrigger>
               <PopoverContent className="w-auto p-0" align="start">
                 <Calendar
                   mode="single"
                   selected={data.examDate || undefined}
                   onSelect={(date) => updateData({ examDate: date || null })}
                   disabled={(date) => date < new Date()}
                   initialFocus
                 />
               </PopoverContent>
             </Popover>
             
             {daysUntilExam !== null && daysUntilExam > 0 && (
               <p className="mt-3 text-sm">
                 <span className="font-semibold text-primary">{daysUntilExam} days</span>
                 <span className="text-muted-foreground"> until your exam</span>
               </p>
             )}
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