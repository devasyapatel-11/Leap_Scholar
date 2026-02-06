 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Target, Flame, Clock } from 'lucide-react';
 
 interface WeeklyStatsProps {
   completedGoals: number;
   currentStreak: number;
   dailyStudyTime: number;
 }
 
 export function WeeklyStats({ completedGoals, currentStreak, dailyStudyTime }: WeeklyStatsProps) {
   const estimatedTotalTime = completedGoals * dailyStudyTime;
 
   const stats = [
     {
       label: 'Goals Completed',
       value: completedGoals,
       suffix: '/ 28',
       icon: Target,
       color: 'text-primary',
       bgColor: 'bg-primary/10',
     },
     {
       label: 'Current Streak',
       value: currentStreak,
       suffix: 'days',
       icon: Flame,
       color: 'text-warning',
       bgColor: 'bg-warning/10',
     },
     {
       label: 'Total Study Time',
       value: estimatedTotalTime,
       suffix: 'min',
       icon: Clock,
       color: 'text-success',
       bgColor: 'bg-success/10',
     },
   ];
 
   return (
     <Card>
       <CardHeader>
         <CardTitle className="text-lg">Your Stats</CardTitle>
       </CardHeader>
       <CardContent className="space-y-4">
         {stats.map(stat => (
           <div key={stat.label} className="flex items-center gap-4">
             <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
               <stat.icon className={`w-5 h-5 ${stat.color}`} />
             </div>
             <div className="flex-1">
               <p className="text-sm text-muted-foreground">{stat.label}</p>
               <p className="text-lg font-semibold text-foreground">
                 {stat.value} <span className="text-sm font-normal text-muted-foreground">{stat.suffix}</span>
               </p>
             </div>
           </div>
         ))}
       </CardContent>
     </Card>
   );
 }