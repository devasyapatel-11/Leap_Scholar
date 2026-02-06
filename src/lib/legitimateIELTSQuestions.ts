// Legitimate IELTS-style questions for all four modules
// These questions are based on actual IELTS test patterns and difficulty levels

export interface IELTSQuestion {
  id: string;
  module: 'listening' | 'reading' | 'writing' | 'speaking';
  type: string;
  question: string;
  options?: string[];
  correctAnswer: any;
  difficulty: 'easy' | 'medium' | 'hard';
  explanation?: string;
}

// LISTENING QUESTIONS - Based on actual IELTS listening test formats
export const legitimateListeningQuestions: IELTSQuestion[] = [
  {
    id: 'L001',
    module: 'listening',
    type: 'multiple_choice',
    question: 'What is the main purpose of the library tour?',
    options: [
      'To show students where to find books',
      'To introduce library facilities and services',
      'To explain how to use the computers',
      'To demonstrate the online catalog system'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The librarian mentions they will give a "quick tour of our facilities" and covers various services like circulation desk, reference section, study rooms, etc.'
  },
  {
    id: 'L002',
    module: 'listening',
    type: 'multiple_choice',
    question: 'What time does the library close on Fridays?',
    options: ['6 PM', '8 PM', '4 PM', '10 PM'],
    correctAnswer: 0,
    difficulty: 'easy',
    explanation: 'The librarian specifically states "8 AM to 6 PM on Fridays."'
  },
  {
    id: 'L003',
    module: 'listening',
    type: 'multiple_choice',
    question: 'How many study rooms are available for group work?',
    options: ['12', '24', '36', '48'],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The librarian mentions "24 study rooms available for group work."'
  },
  {
    id: 'L004',
    module: 'listening',
    type: 'multiple_choice',
    question: 'Where are back issues of periodicals located?',
    options: [
      'On the first floor',
      'In the media room',
      'On the second floor',
      'In the reference section'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The librarian states "Back issues are available on microfilm in the media room next door" when discussing the periodicals section on the second floor.'
  },
  {
    id: 'L005',
    module: 'listening',
    type: 'multiple_choice',
    question: 'What is included in the hall rental prices?',
    options: [
      'Only room rental',
      'Room and utilities',
      'Room, utilities, and internet',
      'Room, utilities, internet, and food'
    ],
    correctAnswer: 2,
    difficulty: 'medium',
    explanation: 'The housing officer states "These prices include utilities and internet access."'
  }
];

// READING QUESTIONS - Based on IELTS Academic Reading test formats
export const legitimateReadingQuestions: IELTSQuestion[] = [
  {
    id: 'R001',
    module: 'reading',
    type: 'multiple_choice',
    question: 'According to the passage, what is "ambient intimacy"?',
    options: [
      'A feeling of constant connection regardless of location',
      'The intimacy between close family members',
      'Privacy in public spaces',
      'The warmth of face-to-face communication'
    ],
    correctAnswer: 0,
    difficulty: 'medium',
    explanation: 'The passage defines ambient intimacy as "a state where people feel constantly connected to their social network regardless of physical location."'
  },
  {
    id: 'R002',
    module: 'reading',
    type: 'multiple_choice',
    question: 'What psychological effects are associated with heavy social media use?',
    options: [
      'Improved self-confidence and reduced anxiety',
      'Increased anxiety, depression, and loneliness',
      'Better communication skills and social skills',
      'No significant psychological effects'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The passage states "Research indicates that heavy social media use is associated with increased rates of anxiety, depression, and feelings of loneliness."'
  },
  {
    id: 'R003',
    module: 'reading',
    type: 'multiple_choice',
    question: 'How has social media affected small businesses?',
    options: [
      'It has made it harder for them to compete',
      'It has created a more level playing field with larger companies',
      'It has eliminated the need for traditional marketing',
      'It has had no impact on small business success'
    ],
    correctAnswer: 1,
    difficulty: 'medium',
    explanation: 'The passage mentions "Small businesses can compete with larger corporations on a more level playing field, as creativity and engagement often matter more than budget size."'
  },
  {
    id: 'R004',
    module: 'reading',
    type: 'multiple_choice',
    question: 'What solution has Rotterdam implemented for flooding?',
    options: [
      'Underground water storage tanks',
      'Sea walls and elevated buildings',
      'Water squares that serve as retention basins',
      'Floating houses and offices'
    ],
    correctAnswer: 2,
    difficulty: 'hard',
    explanation: 'The passage states "Rotterdam has pioneered \'water squares\' - public spaces that double as water retention basins during heavy rainfall."'
  },
  {
    id: 'R005',
    module: 'reading',
    type: 'multiple_choice',
    question: 'How does Singapore address urban heat islands?',
    options: [
      'By installing more air conditioning units',
      'Through extensive greenery requirements for buildings',
      'By using white paint on all buildings',
      'By reducing the number of vehicles in the city'
    ],
    correctAnswer: 1,
    difficulty: 'hard',
    explanation: 'The passage mentions "Singapore has implemented extensive greenery requirements for new buildings, resulting in noticeably lower ambient temperatures."'
  }
];

// WRITING PROMPTS - Based on actual IELTS Writing Task 2 topics
export const legitimateWritingPrompts: IELTSQuestion[] = [
  {
    id: 'W001',
    module: 'writing',
    type: 'essay_task2',
    question: 'Some people believe that technology has made education more effective and accessible, while others argue that it has created more problems than it has solved.\n\nDiscuss both views and give your own opinion.',
    correctAnswer: null,
    difficulty: 'medium',
    explanation: 'This is a classic "discuss both views and give your opinion" essay topic that tests balanced argumentation skills.'
  },
  {
    id: 'W002',
    module: 'writing',
    type: 'essay_task2',
    question: 'In many countries, the proportion of older people is increasing steadily. What problems does this cause for individuals and society? What measures could be taken to deal with this situation?',
    correctAnswer: null,
    difficulty: 'medium',
    explanation: 'This is a "problems and solutions" essay topic that requires analyzing demographic changes and proposing practical solutions.'
  },
  {
    id: 'W003',
    module: 'writing',
    type: 'essay_task2',
    question: 'Some people think that parents should teach children how to be good members of society. Others believe that school is the place to learn this.\n\nDiscuss both views and give your own opinion.',
    correctAnswer: null,
    difficulty: 'easy',
    explanation: 'This education-focused topic tests understanding of socialization and the role of different institutions in character development.'
  },
  {
    id: 'W004',
    module: 'writing',
    type: 'essay_task2',
    question: 'Environmental problems are too big for individual countries and individual people to address. We have reached the stage where the only way to protect the environment is at an international level.\n\nTo what extent do you agree or disagree?',
    correctAnswer: null,
    difficulty: 'hard',
    explanation: 'This environmental topic requires understanding of global cooperation and the limitations of individual action in addressing climate change.'
  },
  {
    id: 'W005',
    module: 'writing',
    type: 'task1_academic',
    question: 'The chart below shows the percentage of household income spent on food, housing, clothing, and entertainment in five different countries.\n\nSummarise the information by selecting and reporting the main features, and make comparisons where relevant.',
    correctAnswer: null,
    difficulty: 'medium',
    explanation: 'This Task 1 academic writing question tests data interpretation and comparison skills.'
  }
];

// SPEAKING QUESTIONS - Based on actual IELTS Speaking test formats
export const legitimateSpeakingQuestions: IELTSQuestion[] = [
  {
    id: 'S001',
    module: 'speaking',
    type: 'part1',
    question: 'What do you usually do in your free time?',
    correctAnswer: null,
    difficulty: 'easy',
    explanation: 'Part 1 questions are personal and designed to warm up the candidate.'
  },
  {
    id: 'S002',
    module: 'speaking',
    type: 'part1',
    question: 'Do you prefer spending time alone or with friends?',
    correctAnswer: null,
    difficulty: 'easy',
    explanation: 'This personal preference question tests the ability to express opinions and provide reasons.'
  },
  {
    id: 'S003',
    module: 'speaking',
    type: 'part1',
    question: 'What hobbies did you have as a child?',
    correctAnswer: null,
    difficulty: 'easy',
    explanation: 'This past tense question tests the ability to talk about personal experiences.'
  },
  {
    id: 'S004',
    module: 'speaking',
    type: 'part2',
    question: 'Describe a memorable journey you have taken.\n\nYou should say:\n- Where you went\n- Who you went with\n- What you did during the journey\n- And explain why this journey was memorable for you',
    correctAnswer: null,
    difficulty: 'medium',
    explanation: 'Part 2 cue cards test the ability to speak at length on a given topic with appropriate structure.'
  },
  {
    id: 'S005',
    module: 'speaking',
    type: 'part3',
    question: 'How has tourism changed in your country over the past few decades?',
    correctAnswer: null,
    difficulty: 'hard',
    explanation: 'Part 3 questions are more abstract and require analytical thinking about broader issues.'
  },
  {
    id: 'S006',
    module: 'speaking',
    type: 'part3',
    question: 'What are the advantages and disadvantages of international tourism?',
    correctAnswer: null,
    difficulty: 'hard',
    explanation: 'This question tests the ability to discuss complex issues from multiple perspectives.'
  }
];

// Helper functions to get legitimate questions
export function getLegitimateListeningQuestions(difficulty?: 'easy' | 'medium' | 'hard', count: number = 4): IELTSQuestion[] {
  let questions = legitimateListeningQuestions;
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  return questions.slice(0, count);
}

export function getLegitimateReadingQuestions(difficulty?: 'easy' | 'medium' | 'hard', count: number = 3): IELTSQuestion[] {
  let questions = legitimateReadingQuestions;
  if (difficulty) {
    questions = questions.filter(q => q.difficulty === difficulty);
  }
  return questions.slice(0, count);
}

export function getLegitimateWritingPrompt(difficulty?: 'easy' | 'medium' | 'hard'): IELTSQuestion {
  let prompts = legitimateWritingPrompts;
  if (difficulty) {
    prompts = prompts.filter(p => p.difficulty === difficulty);
  }
  return prompts[Math.floor(Math.random() * prompts.length)];
}

export function getLegitimateSpeakingQuestions(part: 1 | 2 | 3, count: number = 3): IELTSQuestion[] {
  let questions = legitimateSpeakingQuestions.filter(q => {
    if (part === 1) return q.type === 'part1';
    if (part === 2) return q.type === 'part2';
    if (part === 3) return q.type === 'part3';
    return false;
  });
  
  return questions.slice(0, count);
}

// Get questions by module and difficulty
export function getLegitimateQuestionsByModule(
  module: 'listening' | 'reading' | 'writing' | 'speaking',
  difficulty?: 'easy' | 'medium' | 'hard',
  count: number = 5
): IELTSQuestion[] {
  let questions: IELTSQuestion[] = [];
  
  switch (module) {
    case 'listening':
      questions = getLegitimateListeningQuestions(difficulty, count);
      break;
    case 'reading':
      questions = getLegitimateReadingQuestions(difficulty, count);
      break;
    case 'writing':
      const writingPrompt = getLegitimateWritingPrompt(difficulty);
      questions = writingPrompt ? [writingPrompt] : [];
      break;
    case 'speaking':
      questions = getLegitimateSpeakingQuestions(1, count);
      break;
  }
  
  return questions;
}
