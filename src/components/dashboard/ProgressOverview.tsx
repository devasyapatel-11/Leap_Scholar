 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Progress } from '@/components/ui/progress';
 import { TrendingUp, TrendingDown, Minus, Headphones, BookOpen, PenLine, Mic } from 'lucide-react';
 import { UserProgress } from '@/hooks/useProfile';
 import { cn } from '@/lib/utils';
 
 interface ProgressOverviewProps {
   progress: UserProgress | null;
   targetBand: number;
 }
 
 const skills = [
   { key: 'listening_level', name: 'Listening', icon: Headphones, colorClass: 'text-chart-listening' },
   { key: 'reading_level', name: 'Reading', icon: BookOpen, colorClass: 'text-chart-reading' },
   { key: 'writing_level', name: 'Writing', icon: PenLine, colorClass: 'text-chart-writing' },
   { key: 'speaking_level', name: 'Speaking', icon: Mic, colorClass: 'text-chart-speaking' },
 ] as const;
 
 export function ProgressOverview({ progress, targetBand }: ProgressOverviewProps) {
   const levelToBand = (level: number) => {
     return Math.round((level / 100 * 4 + 4) * 2) / 2;
   };
 
   const getProgressToTarget = (level: number) => {
     const currentBand = levelToBand(level);
     const minBand = 4;
     const progressPercent = ((currentBand - minBand) / (targetBand - minBand)) * 100;
     return Math.min(100, Math.max(0, progressPercent));
   };
 
   const getTrend = (level: number) => {
     // For now, return neutral. In real app, compare with previous week
     if (level >= 70) return 'up';
     if (level <= 40) return 'down';
     return 'neutral';
   };
 
   const TrendIcon = ({ trend }: { trend: string }) => {
     if (trend === 'up') return <TrendingUp className="w-4 h-4 text-success" />;
     if (trend === 'down') return <TrendingDown className="w-4 h-4 text-warning" />;
     return <Minus className="w-4 h-4 text-muted-foreground" />;
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <CardTitle className="text-lg">Progress to Target Band {targetBand.toFixed(1)}</CardTitle>
           {progress && (
             <div className="text-right">
               <p className="text-sm text-muted-foreground">Current Overall</p>
               <p className="text-2xl font-bold text-primary">
                 {progress.estimated_band.toFixed(1)}
               </p>
             </div>
           )}
         </div>
       </CardHeader>
       <CardContent className="space-y-6">
         {skills.map(skill => {
           const level = progress?.[skill.key] ?? 50;
           const band = levelToBand(level);
           const progressPercent = getProgressToTarget(level);
           const trend = getTrend(level);
 
           return (
             <div key={skill.key}>
               <div className="flex items-center justify-between mb-2">
                 <div className="flex items-center gap-2">
                   <skill.icon className={cn('w-4 h-4', skill.colorClass)} />
                   <span className="font-medium text-foreground">{skill.name}</span>
                   <TrendIcon trend={trend} />
                 </div>
                 <div className="flex items-center gap-2">
                   <span className="text-sm font-semibold text-foreground">
                     Band {band.toFixed(1)}
                   </span>
                   <span className="text-xs text-muted-foreground">
                     / {targetBand.toFixed(1)}
                   </span>
                 </div>
               </div>
               <div className="relative">
                 <Progress value={progressPercent} className="h-2" />
               </div>
             </div>
           );
         })}
       </CardContent>
     </Card>
   );
 }