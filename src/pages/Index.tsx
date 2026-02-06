import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  BookOpen, 
  Target, 
  TrendingUp, 
  Calendar, 
  Headphones, 
  PenLine, 
  Mic,
  ArrowRight,
  Sparkles
} from 'lucide-react';

const Index = () => {
  const { user, loading } = useAuth();

  const features = [
    {
      icon: Target,
      title: 'Personalized Goals',
      description: 'AI-powered study plan tailored to your target band score and exam date.',
    },
    {
      icon: Calendar,
      title: '28-Day Journey',
      description: 'Structured daily micro-goals covering all four IELTS skills.',
    },
    {
      icon: TrendingUp,
      title: 'Adaptive Learning',
      description: 'Focus shifts to your weaker areas based on assessment results.',
    },
    {
      icon: Sparkles,
      title: 'Smart Recovery',
      description: 'Missed a few days? Quick catch-up sessions get you back on track.',
    },
  ];

  const skills = [
    { icon: Headphones, name: 'Listening', color: 'bg-chart-listening' },
    { icon: BookOpen, name: 'Reading', color: 'bg-chart-reading' },
    { icon: PenLine, name: 'Writing', color: 'bg-chart-writing' },
    { icon: Mic, name: 'Speaking', color: 'bg-chart-speaking' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold text-lg text-foreground">LeapScholar</span>
            </div>

            <div className="flex items-center gap-3">
              {loading ? null : user ? (
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild>
                    <Link to="/login">Log in</Link>
                  </Button>
                  <Button asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            Leap Scholar IELTS Preparation
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6 max-w-3xl mx-auto leading-tight">
            Master IELTS with{' '}
            <span className="text-primary">Daily Micro-Goals</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Adaptive learning that focuses on your weak points. Build consistent study habits 
            with bite-sized daily goals designed to maximize your band score.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link to="/signup">
                Start Free Assessment <ArrowRight className="w-4 h-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/login">I have an account</Link>
            </Button>
          </div>

          {/* Skills preview */}
          <div className="flex items-center justify-center gap-3 mt-12 flex-wrap">
            {skills.map(skill => (
              <div 
                key={skill.name}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-card border"
              >
                <div className={`w-6 h-6 rounded ${skill.color} flex items-center justify-center`}>
                  <skill.icon className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-medium text-foreground">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Why LeapScholar Works
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Our approach combines proven learning science with personalization 
              to help you achieve your target band score.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map(feature => (
              <Card key={feature.title} className="border-2 hover:border-primary/50 transition-colors">
                <CardContent className="pt-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              How It Works
            </h2>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {[
                { step: 1, title: 'Take the Assessment', description: 'Quick diagnostic quiz to understand your current level across all four skills.' },
                { step: 2, title: 'Get Your Plan', description: 'Receive a personalized 28-day study plan focused on your target band score.' },
                { step: 3, title: 'Complete Daily Goals', description: 'Each day brings a focused lesson, practice exercise, and micro-assessment.' },
                { step: 4, title: 'Track Your Progress', description: 'Watch your estimated band score improve as you complete goals consistently.' },
              ].map((item, index) => (
                <div key={item.step} className="flex gap-4">
                  <div className="shrink-0">
                    <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                      {item.step}
                    </div>
                    {index < 3 && (
                      <div className="w-0.5 h-8 bg-border mx-auto mt-2" />
                    )}
                  </div>
                  <div className="pt-1.5">
                    <h3 className="font-semibold text-foreground mb-1">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-primary-foreground mb-4">
            Ready to Start Your Leap Scholar IELTS Journey?
          </h2>
          <p className="text-primary-foreground/80 mb-8 max-w-xl mx-auto">
            Join thousands of students who have improved their band scores with our 
            personalized daily micro-goals approach.
          </p>
          <Button size="lg" variant="secondary" asChild className="gap-2">
            <Link to="/signup">
              Start Free Assessment <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 LeapScholar. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
