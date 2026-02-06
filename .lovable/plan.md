

# IELTS Daily Prep - Implementation Plan

## Overview
A professional, educational IELTS test preparation web application with adaptive daily micro-goals, user authentication via Supabase, and a complete 28-day personalized study plan with progress tracking and smart recovery mechanisms.

---

## Phase 1: Foundation & Authentication

### 1.1 User Authentication System
- **Sign up / Login pages** with email authentication
- **User profiles** table with exam date, target band score, and study preferences
- **Protected routes** - redirect unauthenticated users to login
- **Session management** with persistent login state

### 1.2 Database Setup (Supabase)
- **Users profiles table**: target band, exam date, daily study time commitment
- **User progress table**: current levels for each skill (Listening, Reading, Writing, Speaking)
- **Daily goals table**: 28 pre-defined daily goals with content structure
- **Goal completions table**: track which goals user has completed with scores
- **Assessments table**: store quiz questions and answers
- **User streaks table**: track consecutive days of activity

---

## Phase 2: Onboarding Flow

### 2.1 Welcome Screen
- Compelling headline and subtext explaining the personalized approach
- Clear "Start Assessment" call-to-action
- Professional, educational visual design

### 2.2 Multi-Step Diagnostic Quiz
- **Step 1 - Personal Info**: Target band score selector, exam date picker with days remaining calculation
- **Step 2 - Level Assessment**: 
  - Listening question (multiple choice with placeholder audio)
  - Reading passage with comprehension question
  - Writing confidence self-assessment slider
  - Speaking confidence self-assessment slider
- **Step 3 - Study Commitment**: Daily time availability selection (15/30/45/60 mins)

### 2.3 Results Screen
- Visual card displaying estimated band scores for each skill
- Overall estimated band calculation
- Gap analysis showing difference between current and target
- Clear CTA to view personalized study plan

---

## Phase 3: Main Dashboard

### 3.1 Header Section
- App logo and branding
- Days until exam countdown
- User menu with settings and logout

### 3.2 Daily Goal Card (Primary Focus)
- Current day indicator (Day X of 28)
- Today's goal title and skill focus
- Estimated duration
- Prominent "Start Today's Goal" button
- Yesterday's status and current streak display

### 3.3 Progress Overview
- Four progress bars showing percentage toward target for each skill
- Estimated current band score for each skill
- Trend indicators (improving, needs focus, on track)
- Weekly improvement percentages

### 3.4 Weekly Stats Card
- Days active this week
- Goals completed count
- Total study time accumulated

---

## Phase 4: Daily Goal Learning Flow

### 4.1 Goal Detail Page Structure
- Breadcrumb navigation
- Three-step progress indicator

### 4.2 Video Lesson Section (Step 1)
- Placeholder video player component
- Lesson title and duration
- "Mark Complete & Continue" button

### 4.3 Practice Exercise Section (Step 2)
- Placeholder audio player for listening exercises
- Reading passages for reading exercises
- Multiple choice questions with radio buttons
- Show/hide transcript toggle
- Submit button with validation

### 4.4 Micro-Assessment Section (Step 3)
- 5 quick questions related to the lesson
- Timer display
- Submit and score calculation

### 4.5 Results Screen
- Score display with band level interpretation
- Explanations for incorrect answers
- Progress update animation showing improvement
- Tomorrow's goal preview
- Return to dashboard button

---

## Phase 5: Recovery Mode

### 5.1 Recovery Detection
- Automatic detection when user misses 3+ consecutive days
- Trigger recovery mode on next login

### 5.2 Recovery Screen
- Warm, encouraging "Welcome Back" message
- List of missed goals
- Condensed "Quick Catch-Up Session" option (20 mins)
- Alternative to skip and continue with current day

### 5.3 Catch-Up Session
- Condensed video covering key points from missed days
- 5 mixed practice questions
- Quick 3-question assessment
- Completion screen with "Back on Track" celebration

---

## Phase 6: Weekly Reports

### 6.1 Weekly Summary Page (Every Sunday)
- Week completion celebration
- Days active and goals completed stats
- Total study time for the week

### 6.2 Skills Progress Section
- Before/after progress percentages for each skill
- Trend arrows and improvement amounts
- Overall band estimate progression

### 6.3 Exam Readiness Analysis
- Current projection vs target comparison
- Gap remaining to close
- Projected exam score at current pace

### 6.4 Next Week Preview
- Focus areas for upcoming week
- Brief description of planned activities
- CTA to view full week plan

---

## Phase 7: Content & Data

### 7.1 28-Day Goal Content Structure
- **Week 1 (Days 1-7)**: Foundation skills for all 4 components
- **Week 2 (Days 8-14)**: Deep dive into weaker areas based on diagnostic
- **Week 3 (Days 15-21)**: Advanced techniques and practice
- **Week 4 (Days 22-28)**: Mock tests and exam preparation

### 7.2 Sample Content Creation
- Placeholder video URLs for each lesson
- Sample reading passages (150-250 words each)
- Multiple choice questions for each skill type
- Self-assessment prompts for Writing and Speaking
- Answer explanations for all questions

---

## Phase 8: Supporting Features

### 8.1 Progress Calculation Logic
- Assessment score to progress percentage conversion
- Band score estimation algorithm
- Skill-specific improvement tracking

### 8.2 Streak System
- Consecutive day tracking
- Streak reset on missed days (except recovery mode)
- Streak celebration milestones

### 8.3 Responsive Design
- Desktop: Two-column layout with goal card and progress overview
- Tablet: Stacked single column with 2x2 progress grid
- Mobile: Simplified single column with focused current goal

---

## Design Approach

### Visual Style: Professional & Educational
- Clean, structured layouts similar to traditional e-learning platforms
- Clear hierarchy with prominent progress metrics
- Subtle animations for state transitions
- Encouraging but professional tone in all messaging
- Color scheme: Indigo primary, green for success, amber for focus areas

### Key UI Components
- Progress bars with band scores and trends
- Goal cards with status indicators
- Assessment question components
- Stats and metrics cards
- Video/audio player placeholders

---

## Technical Implementation

- **Frontend**: React with TypeScript, Tailwind CSS
- **Backend**: Supabase (authentication, database, real-time updates)
- **State Management**: React Context for global state
- **Charts**: Recharts for progress visualization
- **Date Handling**: date-fns for exam countdown and streak calculation
- **Icons**: Lucide React for consistent iconography

