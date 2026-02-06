 import { Button } from '@/components/ui/button';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
 import { cn } from '@/lib/utils';
 import { OnboardingData } from '@/pages/Onboarding';
 
 interface CommitmentStepProps {
   data: OnboardingData;
   updateData: (updates: Partial<OnboardingData>) => void;
   onNext: () => void;
   onBack: () => void;
 }
 
 const TIME_OPTIONS = [
   { value: 15, label: '15 min', description: 'Quick daily practice' },
   { value: 30, label: '30 min', description: 'Recommended' },
   { value: 45, label: '45 min', description: 'Intensive preparation' },
   { value: 60, label: '60 min', description: 'Maximum progress' },
 ];
 
 export function CommitmentStep({ data, updateData, onNext, onBack }: CommitmentStepProps) {
   return (
     <div>
       <h1 className="text-2xl font-bold text-foreground mb-2">
         Daily Study Commitment
       </h1>
       <p className="text-muted-foreground mb-6">
         How much time can you dedicate to IELTS practice each day?
       </p>
 
       <div className="grid sm:grid-cols-2 gap-4 mb-8">
         {TIME_OPTIONS.map(option => (
           <Card
             key={option.value}
             className={cn(
               'cursor-pointer transition-all hover:border-primary',
               data.dailyTime === option.value && 'border-primary bg-primary/5'
             )}
             onClick={() => updateData({ dailyTime: option.value })}
           >
             <CardContent className="pt-6">
               <div className="flex items-center gap-3">
                 <div className={cn(
                   'w-12 h-12 rounded-lg flex items-center justify-center',
                   data.dailyTime === option.value 
                     ? 'bg-primary text-primary-foreground' 
                     : 'bg-muted'
                 )}>
                   <Clock className="w-6 h-6" />
                 </div>
                 <div>
                   <h3 className="text-lg font-semibold">{option.label}</h3>
                   <p className="text-sm text-muted-foreground">{option.description}</p>
                 </div>
               </div>
             </CardContent>
           </Card>
         ))}
       </div>
 
       <Card className="bg-muted/50">
         <CardContent className="pt-6">
           <p className="text-sm text-muted-foreground">
             <strong className="text-foreground">Tip:</strong> Consistency beats intensity. 
             It's better to practice 30 minutes daily than 2 hours once a week. 
             You can always adjust this later in your settings.
           </p>
         </CardContent>
       </Card>
 
       <div className="flex justify-between mt-8">
         <Button variant="ghost" onClick={onBack} className="gap-2">
           <ArrowLeft className="w-4 h-4" /> Back
         </Button>
         <Button onClick={onNext} className="gap-2">
           See My Results <ArrowRight className="w-4 h-4" />
         </Button>
       </div>
     </div>
   );
 }