export type PacingMode = 'INTENSIVE' | 'BALANCED' | 'STEADY_BUILD';
export type GoalType = 'foundation' | 'intermediate' | 'advanced' | 'mock' | 'recovery';
export type SkillFocus = 'listening' | 'reading' | 'writing' | 'speaking' | 'mixed';

export interface AdaptiveGoal {
  dayNumber: number;
  weekNumber: number;
  pacingMode: PacingMode;
  goalType: GoalType;
  skillFocus: SkillFocus;
  title: string;
  description: string;
  durationMinutes: number;
  difficultyLevel: number; // 1-5
  content: {
    lesson?: {
      videoUrl?: string;
      transcript?: string;
      keyPoints: string[];
    };
    practice?: {
      exercises: Array<{
        type: string;
        instructions: string;
        timeLimit?: number;
      }>;
    };
    microAssessment: {
      questions: Array<{
        question: string;
        options?: string[];
        type: 'multiple_choice' | 'text' | 'speaking';
        correctAnswer: any;
      }>;
      timeLimit: number; // minutes
    };
  };
}

export interface UserPerformance {
  skillLevels: Record<SkillFocus, number>; // 0-100
  recentScores: Array<{
    skillFocus: SkillFocus;
    score: number;
    timestamp: Date;
  }>;
  completedGoals: number;
  missedDays: number;
  averageTimeSpent: number;
}

import { getLegitimateQuestionsByModule } from './legitimateIELTSQuestions';

export class AdaptivePacingEngine {
  static calculatePacingMode(examDate: Date, currentDate: Date = new Date()): PacingMode {
    const daysRemaining = Math.ceil((examDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysRemaining <= 45) return 'INTENSIVE';
    if (daysRemaining <= 90) return 'BALANCED';
    return 'STEADY_BUILD';
  }

  static adjustGoalDifficulty(
    weekNumber: number,
    pacingMode: PacingMode,
    performance: UserPerformance
  ): GoalType {
    // Week 1: Always foundation (easy wins)
    if (weekNumber === 1) return 'foundation';
    
    // Adaptive based on pacing and performance
    const avgPerformance = Object.values(performance.skillLevels).reduce((a, b) => a + b, 0) / 4;
    
    switch (pacingMode) {
      case 'INTENSIVE':
        if (weekNumber <= 2) return 'intermediate';
        if (weekNumber <= 3) return 'advanced';
        return 'mock';
      
      case 'BALANCED':
        if (weekNumber <= 2) return 'foundation';
        if (weekNumber <= 3) return 'intermediate';
        return 'advanced';
      
      case 'STEADY_BUILD':
        if (weekNumber <= 3) return 'foundation';
        if (weekNumber <= 5) return 'intermediate';
        return 'advanced';
      
      default:
        return 'foundation';
    }
  }

  static determineSkillFocus(
    performance: UserPerformance,
    weekNumber: number,
    pacingMode: PacingMode
  ): SkillFocus {
    // Find weakest skill
    const sortedSkills = Object.entries(performance.skillLevels)
      .sort(([, a], [, b]) => a - b) as [SkillFocus, number][];
    
    const weakestSkill = sortedSkills[0][0];
    const secondWeakest = sortedSkills[1][0];
    
    // Week 1: Mixed focus for foundation
    if (weekNumber === 1) return 'mixed';
    
    // Week 2-3: Focus on weakest areas
    if (weekNumber <= 3) {
      return weekNumber % 2 === 0 ? weakestSkill : secondWeakest;
    }
    
    // Later weeks: Rotate based on performance
    const recentWeakness = performance.recentScores
      .filter(score => score.score < 70)
      .sort((a, b) => a.score - b.score)[0]?.skillFocus;
    
    return recentWeakness || weakestSkill;
  }

  static generateDailyGoal(
    dayNumber: number,
    examDate: Date,
    performance: UserPerformance,
    dailyTimePreference: number = 30
  ): AdaptiveGoal {
    const weekNumber = Math.ceil(dayNumber / 7);
    const pacingMode = this.calculatePacingMode(examDate);
    const goalType = this.adjustGoalDifficulty(weekNumber, pacingMode, performance);
    const skillFocus = this.determineSkillFocus(performance, weekNumber, pacingMode);
    
    // Adjust duration based on pacing mode
    let durationMinutes = dailyTimePreference;
    switch (pacingMode) {
      case 'INTENSIVE':
        durationMinutes = Math.max(45, dailyTimePreference + 15);
        break;
      case 'BALANCED':
        durationMinutes = dailyTimePreference;
        break;
      case 'STEADY_BUILD':
        durationMinutes = Math.min(25, dailyTimePreference - 5);
        break;
    }

    const goal = this.createGoalContent(
      dayNumber,
      weekNumber,
      pacingMode,
      goalType,
      skillFocus,
      durationMinutes,
      performance
    );

    return goal;
  }

  private static createGoalContent(
    dayNumber: number,
    weekNumber: number,
    pacingMode: PacingMode,
    goalType: GoalType,
    skillFocus: SkillFocus,
    durationMinutes: number,
    performance: UserPerformance
  ): AdaptiveGoal {
    const baseContent = this.getSkillContent(skillFocus, goalType, weekNumber);
    
    return {
      dayNumber,
      weekNumber,
      pacingMode,
      goalType,
      skillFocus,
      title: baseContent.title,
      description: baseContent.description,
      durationMinutes,
      difficultyLevel: this.calculateDifficulty(goalType, weekNumber, pacingMode),
      content: baseContent.content
    };
  }

  private static calculateDifficulty(
    goalType: GoalType,
    weekNumber: number,
    pacingMode: PacingMode
  ): number {
    let baseDifficulty = 1;
    
    switch (goalType) {
      case 'foundation':
        baseDifficulty = 1;
        break;
      case 'intermediate':
        baseDifficulty = 2;
        break;
      case 'advanced':
        baseDifficulty = 3;
        break;
      case 'mock':
        baseDifficulty = 4;
        break;
      case 'recovery':
        baseDifficulty = 1;
        break;
    }
    
    // Adjust for pacing mode
    if (pacingMode === 'INTENSIVE') {
      baseDifficulty += 1;
    } else if (pacingMode === 'STEADY_BUILD') {
      baseDifficulty = Math.max(1, baseDifficulty - 1);
    }
    
    // Adjust for week progression
    baseDifficulty += Math.floor((weekNumber - 1) / 2);
    
    return Math.min(5, Math.max(1, baseDifficulty));
  }

  private static getSkillContent(
    skill: string,
    goalType: string,
    weekNumber: number
  ): { title: string; description: string; content: any } {
    const legitimateQuestions = getLegitimateQuestionsByModule(
      skill as 'listening' | 'reading' | 'writing' | 'speaking',
      goalType === 'foundation' ? 'easy' : goalType === 'advanced' ? 'hard' : 'medium'
    );
    
    const question = legitimateQuestions[0] || legitimateQuestions[legitimateQuestions.length - 1];
    
    return {
      title: `${skill.charAt(0).toUpperCase() + skill.slice(1)} Practice - ${question.question.substring(0, 50)}...`,
      description: `Focus on ${skill} with this IELTS-style question. ${question.explanation || ''}`,
      content: {
        lesson: {
          videoUrl: `/videos/${skill}-tutorial.mp4`,
          keyPoints: [
            `Understand ${skill} question types and strategies`,
            `Practice with authentic IELTS materials`,
            `Improve your ${skill} band score`
          ]
        },
        practice: {
          exercises: [
            {
              type: `${skill}_practice`,
              instructions: `Complete this ${skill} exercise based on real IELTS test format`,
              timeLimit: 15
            }
          ]
        },
        microAssessment: {
          questions: legitimateQuestions.slice(0, 3).map(q => ({
            question: q.question,
            options: q.options || [],
            type: q.type as 'multiple_choice' | 'text' | 'speaking',
            correctAnswer: q.correctAnswer
          })),
          timeLimit: 5
        }
      }
    };
  }

  static generateRecoverySession(
    missedDays: number,
    pacingMode: PacingMode,
    performance: UserPerformance
  ): AdaptiveGoal {
    const recoveryType = missedDays <= 2 ? 'quick_catchup' : 'condensed_session';
    const duration = missedDays <= 2 ? 20 : 30;
    
    return {
      dayNumber: 0, // Special recovery session
      weekNumber: 0,
      pacingMode,
      goalType: 'recovery',
      skillFocus: 'mixed',
      title: `Recovery Session - ${missedDays} Days Missed`,
      description: `Quick catch-up covering the most important concepts from your missed days.`,
      durationMinutes: duration,
      difficultyLevel: 1,
      content: {
        lesson: {
          keyPoints: [
            "Life happens - don't worry about missed days",
            "Focus on the most critical concepts",
            "Get back on track with confidence"
          ]
        },
        practice: {
          exercises: [
            {
              type: "recovery_practice",
              instructions: "Complete these essential exercises to get back on track",
              timeLimit: duration
            }
          ]
        },
        microAssessment: {
          questions: [
            {
              question: "How ready are you to continue your IELTS journey?",
              type: "multiple_choice" as const,
              options: ["Very ready", "Somewhat ready", "Need more time", "Not sure"],
              correctAnswer: 0
            }
          ],
          timeLimit: 2
        }
      }
    };
  }
}
