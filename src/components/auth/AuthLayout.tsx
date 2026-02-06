import { ReactNode } from 'react';
import { BookOpen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  const navigate = useNavigate();
  
  const handleLogoClick = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-primary/80" />
        <div className="relative z-10 flex flex-col justify-center px-12 text-primary-foreground">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <BookOpen className="w-7 h-7" />
            </div>
            <span className="text-2xl font-bold cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick}>LeapScholar</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">
            Master IELTS Your Way
          </h1>
          <p className="text-lg text-primary-foreground/80 max-w-md">
            Personalized daily micro-goals, adaptive learning, and smart progress tracking 
            to help you achieve your target band score.
          </p>
          <div className="mt-12 grid grid-cols-2 gap-6">
            <div className="p-4 rounded-lg bg-primary-foreground/10 backdrop-blur">
              <div className="text-3xl font-bold">∞</div>
              <div className="text-sm text-primary-foreground/70">Adaptive Study Plans</div>
            </div>
            <div className="p-4 rounded-lg bg-primary-foreground/10 backdrop-blur">
              <div className="text-3xl font-bold">4</div>
              <div className="text-sm text-primary-foreground/70">Skills Covered</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-12">
        <div className="mx-auto w-full max-w-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground cursor-pointer hover:opacity-80 transition-opacity" onClick={handleLogoClick}>LeapScholar</span>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground">{title}</h2>
            {subtitle && (
              <p className="mt-2 text-muted-foreground">{subtitle}</p>
            )}
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
