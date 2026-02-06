-- Enhanced schema for IELTS Prep Engagement Solution
-- Add new tables and update existing ones

-- Update profiles table with new engagement fields
ALTER TABLE public.profiles 
ADD COLUMN pacing_mode TEXT CHECK (pacing_mode IN ('INTENSIVE', 'BALANCED', 'STEADY_BUILD')),
ADD COLUMN diagnostic_completed BOOLEAN DEFAULT false,
ADD COLUMN diagnostic_score JSONB,
ADD COLUMN daily_study_time_preference INTEGER DEFAULT 30,
ADD COLUMN current_week_number INTEGER DEFAULT 1,
ADD COLUMN comebacks_streak INTEGER DEFAULT 0;

-- Create diagnostic_assessments table for onboarding
CREATE TABLE public.diagnostic_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_data JSONB NOT NULL,
  component_scores JSONB NOT NULL,
  overall_band_estimate NUMERIC(2,1),
  weakest_areas TEXT[],
  strongest_areas TEXT[],
  recommendations JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Create adaptive_daily_goals table for personalized goals
CREATE TABLE public.adaptive_daily_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  goal_date DATE NOT NULL,
  day_number INTEGER NOT NULL,
  week_number INTEGER NOT NULL,
  pacing_mode TEXT NOT NULL,
  goal_type TEXT NOT NULL CHECK (goal_type IN ('foundation', 'intermediate', 'advanced', 'mock', 'recovery')),
  skill_focus TEXT NOT NULL CHECK (skill_focus IN ('listening', 'reading', 'writing', 'speaking', 'mixed')),
  title TEXT NOT NULL,
  description TEXT,
  duration_minutes INTEGER NOT NULL,
  difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
  content JSONB,
  micro_assessment JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  score INTEGER,
  time_spent_minutes INTEGER,
  UNIQUE(user_id, goal_date)
);

-- Create micro_assessments table for continuous feedback
CREATE TABLE public.micro_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.adaptive_daily_goals(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  assessment_type TEXT NOT NULL CHECK (assessment_type IN ('pre_lesson', 'post_lesson', 'skill_check')),
  questions JSONB NOT NULL,
  user_answers JSONB,
  score INTEGER,
  max_score INTEGER,
  band_equivalent NUMERIC(2,1),
  feedback JSONB,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create recovery_sessions table for momentum saver
CREATE TABLE public.recovery_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  missed_days INTEGER NOT NULL,
  recovery_type TEXT CHECK (recovery_type IN ('quick_catchup', 'condensed_session', 'fresh_start')),
  content JSONB,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  comeback_day_number INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create weekly_progress_reports table
CREATE TABLE public.weekly_progress_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_number INTEGER NOT NULL,
  days_active INTEGER NOT NULL,
  goals_completed INTEGER NOT NULL,
  total_study_time_minutes INTEGER NOT NULL,
  skill_progress JSONB NOT NULL,
  overall_band_start NUMERIC(2,1),
  overall_band_current NUMERIC(2,1),
  projected_band NUMERIC(2,1),
  next_week_focus JSONB,
  milestone_achieved TEXT,
  report_generated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, week_number)
);

-- Create user_milestones table for achievement tracking
CREATE TABLE public.user_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  milestone_type TEXT NOT NULL CHECK (milestone_type IN ('week_complete', 'streak_achieved', 'skill_mastery', 'mock_complete')),
  milestone_data JSONB,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Update user_progress with more detailed tracking
ALTER TABLE public.user_progress 
ADD COLUMN skill_progress_details JSONB,
ADD COLUMN last_assessment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN improvement_rate NUMERIC(5,2),
ADD COLUMN focus_areas TEXT[];

-- Create engagement_analytics table for tracking success metrics
CREATE TABLE public.engagement_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  event_data JSONB,
  session_duration_minutes INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on new tables
ALTER TABLE public.diagnostic_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adaptive_daily_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.micro_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recovery_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_progress_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engagement_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for new tables
CREATE POLICY "Users can view own diagnostic" ON public.diagnostic_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own diagnostic" ON public.diagnostic_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own diagnostic" ON public.diagnostic_assessments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own daily goals" ON public.adaptive_daily_goals FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own daily goals" ON public.adaptive_daily_goals FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own daily goals" ON public.adaptive_daily_goals FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own micro assessments" ON public.micro_assessments FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own micro assessments" ON public.micro_assessments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own recovery sessions" ON public.recovery_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own recovery sessions" ON public.recovery_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recovery sessions" ON public.recovery_sessions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own weekly reports" ON public.weekly_progress_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own weekly reports" ON public.weekly_progress_reports FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own milestones" ON public.user_milestones FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own milestones" ON public.user_milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics" ON public.engagement_analytics FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics" ON public.engagement_analytics FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX idx_adaptive_daily_goals_user_date ON public.adaptive_daily_goals(user_id, goal_date);
CREATE INDEX idx_adaptive_daily_goals_completed ON public.adaptive_daily_goals(user_id, is_completed);
CREATE INDEX idx_micro_assessments_goal ON public.micro_assessments(goal_id);
CREATE INDEX idx_weekly_reports_user_week ON public.weekly_progress_reports(user_id, week_number);
CREATE INDEX idx_engagement_analytics_user_timestamp ON public.engagement_analytics(user_id, timestamp);
CREATE INDEX idx_recovery_sessions_user ON public.recovery_sessions(user_id, is_completed);
