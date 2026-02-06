 import { Button } from '@/components/ui/button';
 import { Card, CardContent } from '@/components/ui/card';
 import { BookOpen, Target, TrendingUp, Calendar, ArrowRight } from 'lucide-react';
 
 interface WelcomeStepProps {
   onNext: () => void;
 }
 
 export function WelcomeStep({ onNext }: WelcomeStepProps) {
   return (
     <div className="text-center">
       <div className="mx-auto w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
         <BookOpen className="w-10 h-10 text-primary" />
       </div>
       
       <h1 className="text-3xl font-bold text-foreground mb-4">
         Welcome to Leap Scholar IELTS Preparation
       </h1>
       <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
         Let's create a personalized 28-day study plan tailored to your goals and current level.
       </p>
 
       <div className="grid sm:grid-cols-3 gap-4 mb-8">
         <Card className="border-2">
           <CardContent className="pt-6 text-center">
             <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mx-auto mb-3">
               <Target className="w-6 h-6 text-primary" />
             </div>
             <h3 className="font-semibold text-foreground mb-1">Personalized Goals</h3>
             <p className="text-sm text-muted-foreground">Tailored to your target band score</p>
           </CardContent>
         </Card>
 
         <Card className="border-2">
           <CardContent className="pt-6 text-center">
             <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center mx-auto mb-3">
               <TrendingUp className="w-6 h-6 text-success" />
             </div>
             <h3 className="font-semibold text-foreground mb-1">Adaptive Learning</h3>
             <p className="text-sm text-muted-foreground">Focus on your weaker areas</p>
           </CardContent>
         </Card>
 
         <Card className="border-2">
           <CardContent className="pt-6 text-center">
             <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center mx-auto mb-3">
               <Calendar className="w-6 h-6 text-warning" />
             </div>
             <h3 className="font-semibold text-foreground mb-1">Daily Micro-Goals</h3>
             <p className="text-sm text-muted-foreground">Bite-sized progress every day</p>
           </CardContent>
         </Card>
       </div>
 
       <Button size="lg" onClick={onNext} className="gap-2">
         Start Assessment <ArrowRight className="w-4 h-4" />
       </Button>
     </div>
   );
 }