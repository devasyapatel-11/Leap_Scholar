import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { BookOpen, User, LogOut, Settings, Calendar } from 'lucide-react';
import { differenceInDays } from 'date-fns';

interface DashboardHeaderProps {
  examDate: Date | null;
}

export function DashboardHeader({ examDate }: DashboardHeaderProps) {
  const { user, signOut } = useAuth();
  const daysUntilExam = examDate ? differenceInDays(examDate, new Date()) : null;

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground">LeapScholar</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {/* Exam countdown */}
            {daysUntilExam !== null && daysUntilExam > 0 && (
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-warning/10 rounded-lg">
                <Calendar className="w-4 h-4 text-warning" />
                <span className="text-sm font-medium">
                  <span className="text-warning">{daysUntilExam}</span>
                  <span className="text-muted-foreground ml-1">days until exam</span>
                </span>
              </div>
            )}

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium truncate">{user?.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut} className="text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}
