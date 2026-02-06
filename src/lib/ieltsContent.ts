// Legitimate IELTS Content Library
// Contains real IELTS-style questions, passages, and audio content for all four modules

export interface IELTSListeningContent {
  id: string;
  title: string;
  audioUrl: string;
  transcript: string;
  questions: ListeningQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface ListeningQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple_choice' | 'completion' | 'matching' | 'map';
}

export interface IELTSReadingContent {
  id: string;
  title: string;
  passage: string;
  questions: ReadingQuestion[];
  difficulty: 'easy' | 'medium' | 'hard';
  wordCount: number;
}

export interface ReadingQuestion {
  id: number;
  question: string;
  type: 'multiple_choice' | 'true_false_not_given' | 'matching' | 'completion' | 'heading';
  options?: string[];
  correctAnswer: any;
}

export interface IELTSWritingContent {
  id: string;
  taskType: 'task1' | 'task2';
  topic: string;
  prompt: string;
  sampleAnswer?: string;
  criteria: WritingCriteria;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface WritingCriteria {
  taskResponse: number;
  coherence: number;
  vocabulary: number;
  grammar: number;
}

export interface IELTSSpeakingContent {
  id: string;
  part: 1 | 2 | 3;
  topic: string;
  questions: string[];
  sampleAnswers?: string[];
  criteria: SpeakingCriteria;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface SpeakingCriteria {
  fluency: number;
  coherence: number;
  vocabulary: number;
  grammar: number;
  pronunciation: number;
}

// LISTENING CONTENT
export const listeningContent: IELTSListeningContent[] = [
  {
    id: 'listening_001',
    title: 'University Library Tour',
    audioUrl: '/audio/university-library-tour.mp3',
    transcript: `Librarian: Good morning everyone and welcome to the university library. I'm Sarah, the head librarian, and I'll be giving you a quick tour of our facilities. 

First, let's start with the main circulation desk here on the ground floor. This is where you can check out and return books. The desk is open from 8 AM to 8 PM Monday through Thursday, and 8 AM to 6 PM on Fridays. Weekend hours are 10 AM to 4 PM.

To your right, you'll find the reference section with dictionaries, encyclopedias, and other non-circulating materials. These must be used within the library and cannot be checked out.

Moving upstairs to the first floor, you'll find our main collection of books. The books are organized by subject using the Library of Congress classification system. You can use the computer terminals to search for specific books or browse the shelves.

The second floor houses our periodicals section with current newspapers, magazines, and academic journals. Back issues are available on microfilm in the media room next door.

We also have 24 study rooms available for group work. You can reserve these online up to two weeks in advance. Each room has a whiteboard, projector, and seating for 4-6 people.

Finally, our digital resources include access to over 50 academic databases, e-books, and streaming video services. You can access these from any computer on campus or remotely with your student ID and password.

Are there any questions about the facilities?`,
    questions: [
      {
        id: 1,
        question: 'What is the name of the head librarian?',
        options: ['Sarah', 'Maria', 'Jennifer', 'Emily'],
        correctAnswer: 0,
        type: 'multiple_choice'
      },
      {
        id: 2,
        question: 'What time does the library close on Fridays?',
        options: ['6 PM', '8 PM', '4 PM', '10 PM'],
        correctAnswer: 0,
        type: 'multiple_choice'
      },
      {
        id: 3,
        question: 'How many study rooms are available for group work?',
        options: ['12', '24', '36', '48'],
        correctAnswer: 1,
        type: 'multiple_choice'
      },
      {
        id: 4,
        question: 'Where are the back issues of periodicals located?',
        options: ['On the first floor', 'In the media room', 'On the second floor', 'In the reference section'],
        correctAnswer: 1,
        type: 'multiple_choice'
      }
    ],
    difficulty: 'medium'
  },
  {
    id: 'listening_002',
    title: 'Student Housing Information',
    audioUrl: '/audio/student-housing.mp3',
    transcript: `Housing Officer: Good morning and welcome to the student housing information session. I'm David from the accommodation office, and I'm here to explain your housing options.

First, let's talk about university halls of residence. We have three main halls: North Hall, South Hall, and West Hall. North Hall is our newest facility, offering en-suite rooms for 450 students. South Hall has 380 rooms with shared bathrooms, and West House provides 320 standard rooms.

All halls include basic furniture - a bed, desk, chair, and wardrobe. You'll need to bring your own bedding, kitchen utensils, and personal items. Each hall has a common room with TV, kitchen facilities, and laundry rooms that are open 24 hours.

The cost for North Hall is £180 per week, South Hall is £140 per week, and West Hall is £120 per week. These prices include utilities and internet access.

If you prefer private accommodation, we maintain a list of approved landlords and properties. The average cost for a shared house in the area is £80-£100 per week, while a one-bedroom flat costs £150-£200 per week.

For international students, we guarantee accommodation in university halls for your first year, provided you apply by the deadline of May 31st.

Applications open on March 1st and I'd recommend applying early as places fill up quickly. You can apply online through the student portal or visit our office in person.

Any questions about housing options?`,
    questions: [
      {
        id: 1,
        question: 'How many rooms does North Hall have?',
        options: ['320', '380', '450', '500'],
        correctAnswer: 2,
        type: 'multiple_choice'
      },
      {
        id: 2,
        question: 'What is the weekly cost for South Hall?',
        options: ['£120', '£140', '£160', '£180'],
        correctAnswer: 1,
        type: 'multiple_choice'
      },
      {
        id: 3,
        question: 'When is the application deadline for guaranteed housing?',
        options: ['March 1st', 'April 30th', 'May 31st', 'June 15th'],
        correctAnswer: 2,
        type: 'multiple_choice'
      },
      {
        id: 4,
        question: 'What is included in the hall prices?',
        options: ['Only room rental', 'Room and utilities', 'Room, utilities, and internet', 'Room, utilities, internet, and food'],
        correctAnswer: 2,
        type: 'multiple_choice'
      }
    ],
    difficulty: 'medium'
  }
];

// READING CONTENT
export const readingContent: IELTSReadingContent[] = [
  {
    id: 'reading_001',
    title: 'The Impact of Social Media on Communication',
    passage: `Social media has fundamentally transformed the way people communicate in the 21st century. Platforms such as Facebook, Twitter, Instagram, and TikTok have created new channels for interaction that were unimaginable just two decades ago. This digital revolution has affected everything from personal relationships to business communication and political discourse.

One of the most significant changes has been the speed and immediacy of communication. Whereas traditional methods like letters or even emails required waiting periods for responses, social media enables instant communication across geographical boundaries. This has created what sociologists call "ambient intimacy" - a state where people feel constantly connected to their social network regardless of physical location.

However, this constant connectivity comes with drawbacks. Research indicates that heavy social media use is associated with increased rates of anxiety, depression, and feelings of loneliness. The curated nature of social media content, where users typically present idealized versions of their lives, can lead to social comparison and diminished self-esteem among viewers.

The business world has been equally transformed. Companies now use social media for marketing, customer service, and brand building. Traditional advertising has been supplemented by influencer marketing and viral content strategies. Small businesses can compete with larger corporations on a more level playing field, as creativity and engagement often matter more than budget size.

Politically, social media has become a double-edged sword. On one hand, it has enabled grassroots movements and given voice to previously marginalized groups. On the other hand, it has facilitated the spread of misinformation and echo chambers where people are only exposed to viewpoints that confirm their existing beliefs.

Looking to the future, emerging technologies like virtual reality and augmented reality promise to further revolutionize social media. These platforms may create more immersive and interactive experiences, potentially blurring the line between digital and physical reality even further.

As society continues to adapt to these technological changes, the challenge will be to harness the benefits of social media while mitigating its negative effects. Digital literacy and mindful usage will become increasingly important skills for navigating this complex communication landscape.`,
    questions: [
      {
        id: 1,
        question: 'According to the passage, what is "ambient intimacy"?',
        options: [
          'A feeling of constant connection regardless of location',
          'The intimacy between close family members',
          'Privacy in public spaces',
          'The warmth of face-to-face communication'
        ],
        correctAnswer: 0,
        type: 'multiple_choice'
      },
      {
        id: 2,
        question: 'What psychological effects are associated with heavy social media use?',
        options: [
          'Improved self-confidence and reduced anxiety',
          'Increased anxiety, depression, and loneliness',
          'Better communication skills and social skills',
          'No significant psychological effects'
        ],
        correctAnswer: 1,
        type: 'multiple_choice'
      },
      {
        id: 3,
        question: 'How has social media affected small businesses?',
        options: [
          'It has made it harder for them to compete',
          'It has created a more level playing field with larger companies',
          'It has eliminated the need for traditional marketing',
          'It has had no impact on small business success'
        ],
        correctAnswer: 1,
        type: 'multiple_choice'
      },
      {
        id: 4,
        question: 'What does the passage suggest about the future of social media?',
        options: [
          'It will become less popular in the coming years',
          'Virtual and augmented reality will transform social media',
          'Social media will be replaced by traditional communication',
          'The current platforms will remain unchanged'
        ],
        correctAnswer: 1,
        type: 'multiple_choice'
      }
    ],
    difficulty: 'medium',
    wordCount: 380
  },
  {
    id: 'reading_002',
    title: 'Climate Change and Urban Planning',
    passage: `Climate change presents unprecedented challenges for urban planners and city governments worldwide. As global temperatures continue to rise and extreme weather events become more frequent, cities must adapt their infrastructure and policies to ensure resilience and sustainability.

One of the most pressing concerns is sea-level rise, which threatens coastal cities with flooding and erosion. Cities like Miami, Venice, and Jakarta are already experiencing regular flooding in low-lying areas. Urban planners are responding with innovative solutions such as sea walls, elevated infrastructure, and even floating architecture. The Dutch city of Rotterdam has pioneered "water squares" - public spaces that double as water retention basins during heavy rainfall.

Heat islands represent another significant challenge. Urban areas tend to be several degrees warmer than surrounding rural areas due to concrete surfaces, lack of vegetation, and human activity. This effect exacerbates heat waves and increases energy consumption for air conditioning. Solutions include green roofs, increased tree canopy, reflective surfaces, and cool pavement materials. Singapore has implemented extensive greenery requirements for new buildings, resulting in noticeably lower ambient temperatures.

Transportation systems must also adapt to reduce carbon emissions and improve air quality. Many cities are investing in public transit, bicycle infrastructure, and electric vehicle charging networks. Copenhagen has become a model for bicycle-friendly urban design, with over 50% of residents commuting by bike. Chinese cities are rapidly expanding their electric bus fleets and subway systems.

Building codes are being updated to require energy efficiency and renewable energy integration. New construction in many European cities must meet strict standards for insulation, heating, and cooling systems. Some jurisdictions are mandating solar panels on all new buildings. These measures significantly reduce the carbon footprint of urban development.

Water management is becoming increasingly critical as climate patterns shift. Cities are implementing rainwater harvesting, greywater recycling, and drought-resistant landscaping. Melbourne, Australia, has successfully reduced water consumption through comprehensive conservation programs and infrastructure upgrades.

Social equity must be central to climate adaptation strategies. Low-income communities often bear the brunt of climate impacts while having fewer resources to adapt. Progressive cities are ensuring that adaptation measures benefit all residents and don't displace vulnerable populations.

The financial costs of climate adaptation are substantial but pale in comparison to the costs of inaction. The World Bank estimates that investing $1 trillion in urban climate adaptation could avoid $7 trillion in climate-related damages by 2050.

As cities continue to grow and climate change accelerates, urban planning must become increasingly adaptive, integrated, and equitable. The cities that thrive in the coming decades will be those that embrace innovation, collaboration, and long-term thinking.`,
    questions: [
      {
        id: 1,
        question: 'What solution has Rotterdam implemented for flooding?',
        options: [
          'Underground water storage tanks',
          'Sea walls and elevated buildings',
          'Water squares that serve as retention basins',
          'Floating houses and offices'
        ],
        correctAnswer: 2,
        type: 'multiple_choice'
      },
      {
        id: 2,
        question: 'How does Singapore address urban heat islands?',
        options: [
          'By installing more air conditioning units',
          'Through extensive greenery requirements for buildings',
          'By using white paint on all buildings',
          'By reducing the number of vehicles in the city'
        ],
        correctAnswer: 1,
        type: 'multiple_choice'
      },
      {
        id: 3,
        question: 'What percentage of Copenhagen residents commute by bicycle?',
        options: ['25%', '35%', '50%', '65%'],
        correctAnswer: 2,
        type: 'multiple_choice'
      },
      {
        id: 4,
        question: 'What does the World Bank estimate about climate adaptation costs?',
        options: [
          'Costs outweigh benefits by 7 to 1',
          'Benefits outweigh costs by 7 to 1',
          'Costs and benefits are roughly equal',
          'Costs are negligible compared to damages'
        ],
        correctAnswer: 1,
        type: 'multiple_choice'
      }
    ],
    difficulty: 'hard',
    wordCount: 420
  }
];

// WRITING CONTENT
export const writingContent: IELTSWritingContent[] = [
  {
    id: 'writing_task2_001',
    taskType: 'task2',
    topic: 'Technology and Education',
    prompt: `Some people believe that technology has made education more effective and accessible, while others argue that it has created more problems than it has solved.

Discuss both views and give your own opinion.`,
    sampleAnswer: `Technology has revolutionized education in unprecedented ways, transforming how students learn and teachers teach. While some argue that technological advancements have enhanced educational effectiveness and accessibility, others contend that they have introduced significant challenges. This essay will examine both perspectives before presenting my own viewpoint.

Proponents of educational technology highlight several key benefits. Firstly, digital platforms have made learning materials accessible to students regardless of geographical location. Online courses and educational apps allow learners in remote areas to access quality education that was previously unavailable. Additionally, technology enables personalized learning experiences, where students can progress at their own pace and focus on areas where they need improvement. Adaptive learning systems can identify individual learning patterns and provide customized content accordingly.

Furthermore, technology has enhanced collaboration and communication in education. Students can work on group projects using cloud-based tools, participate in virtual classrooms, and access resources from anywhere in the world. This has been particularly valuable during global crises like the COVID-19 pandemic, when traditional classroom learning became impossible.

However, critics raise valid concerns about the drawbacks of technology in education. The digital divide remains a significant issue, with students from disadvantaged backgrounds often lacking access to necessary devices and reliable internet connections. This inequality can exacerbate existing educational disparities rather than reducing them.

Another concern is the potential for distraction and reduced attention spans. The same devices that provide educational content also offer endless entertainment options, making it difficult for students to maintain focus. Moreover, the over-reliance on technology may diminish essential skills such as handwriting, mental arithmetic, and face-to-face communication.

There are also questions about the quality of online education compared to traditional classroom learning. The lack of direct interaction with teachers and peers can limit opportunities for spontaneous discussion, immediate feedback, and the development of social skills.

In my opinion, while technology has indeed transformed education for the better, its implementation must be thoughtful and balanced. The key lies in using technology as a tool to enhance rather than replace traditional educational methods. Educational institutions should invest in bridging the digital divide, providing adequate training for teachers, and developing guidelines for healthy technology use.

The ideal approach combines the best of both worlds: leveraging technology's benefits while maintaining the irreplaceable value of human interaction in education. Teachers should serve as facilitators who guide students through digital resources while also providing the emotional support and personalized attention that technology cannot replicate.

In conclusion, technology has both enhanced and complicated education. Rather than viewing it as either wholly beneficial or harmful, we should recognize it as a powerful tool that requires careful implementation. When used appropriately, technology can make education more effective, accessible, and engaging while preserving the essential human elements of learning.`,
    criteria: {
      taskResponse: 8,
      coherence: 8,
      vocabulary: 8,
      grammar: 8
    },
    difficulty: 'medium'
  },
  {
    id: 'writing_task1_001',
    taskType: 'task1',
    topic: 'University Enrollment Statistics',
    prompt: `The chart below shows the number of students enrolled in different university courses from 2018 to 2022.

Summarise the information by selecting and reporting the main features, and make comparisons where relevant.`,
    criteria: {
      taskResponse: 7,
      coherence: 7,
      vocabulary: 7,
      grammar: 7
    },
    difficulty: 'medium'
  }
];

// SPEAKING CONTENT
export const speakingContent: IELTSSpeakingContent[] = [
  {
    id: 'speaking_part1_001',
    part: 1,
    topic: 'Daily Life and Hobbies',
    questions: [
      'What do you usually do in your free time?',
      'Do you prefer spending time alone or with friends?',
      'What hobbies did you have as a child?',
      'How important are hobbies in a person\'s life?',
      'Do you think people have enough time for hobbies nowadays?'
    ],
    sampleAnswers: [
      'In my free time, I enjoy reading books and watching documentaries. I find that these activities help me relax while also learning something new. Recently, I\'ve been particularly interested in history and science documentaries.',
      'I think I prefer a balance of both. I enjoy spending time with friends because it\'s fun and helps me stay connected, but I also need alone time to recharge and focus on my personal interests.',
      'As a child, I loved collecting stamps and drawing. I had a huge stamp collection from different countries, and I spent hours drawing cartoons and landscapes. These hobbies helped me develop patience and creativity.',
      'I believe hobbies are extremely important. They provide a way to de-stress, develop new skills, and maintain mental health. Hobbies also help people discover their passions and can sometimes even lead to career opportunities.',
      'Unfortunately, I don\'t think people have enough time for hobbies nowadays. With work, studies, and family responsibilities, many people struggle to find time for activities they enjoy. This is unfortunate because hobbies are essential for work-life balance.'
    ],
    criteria: {
      fluency: 7,
      coherence: 7,
      vocabulary: 7,
      grammar: 7,
      pronunciation: 7
    },
    difficulty: 'easy'
  },
  {
    id: 'speaking_part2_001',
    part: 2,
    topic: 'Describe a memorable journey you have taken',
    questions: [
      'You should say:',
      'Where you went',
      'Who you went with',
      'What you did during the journey',
      'And explain why this journey was memorable for you'
    ],
    sampleAnswers: [
      'I\'d like to talk about a memorable journey I took to the mountains last year with my best friend. We decided to go hiking in the Himalayas, specifically to a place called Manali in India. We went in October when the weather was perfect - not too cold and the autumn colors were breathtaking.',
      'During our week-long trip, we hiked to several scenic spots, including Rohtang Pass and Solang Valley. We also tried local cuisine, visited ancient temples, and interacted with the local people. One evening, we stayed in a small village where we experienced traditional Himalayan hospitality.',
      'What made this journey truly memorable was the combination of natural beauty and personal growth. The mountain views were simply spectacular, and waking up to see snow-capped peaks every morning felt like a dream. But more importantly, the journey challenged me physically and mentally. The long hikes tested my endurance, and being away from modern technology helped me appreciate simplicity and nature.',
      'Additionally, the time spent with my friend strengthened our friendship. We had deep conversations while walking, supported each other during difficult parts of the hike, and created memories that we still talk about today. This journey taught me the importance of stepping out of my comfort zone and appreciating the natural world.'
    ],
    criteria: {
      fluency: 8,
      coherence: 8,
      vocabulary: 8,
      grammar: 8,
      pronunciation: 7
    },
    difficulty: 'medium'
  }
];

// Helper functions to get content by difficulty and skill
export function getListeningContent(difficulty?: 'easy' | 'medium' | 'hard'): IELTSListeningContent {
  const filtered = difficulty ? 
    listeningContent.filter(content => content.difficulty === difficulty) : 
    listeningContent;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getReadingContent(difficulty?: 'easy' | 'medium' | 'hard'): IELTSReadingContent {
  const filtered = difficulty ? 
    readingContent.filter(content => content.difficulty === difficulty) : 
    readingContent;
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getWritingContent(taskType: 'task1' | 'task2', difficulty?: 'easy' | 'medium' | 'hard'): IELTSWritingContent {
  const filtered = writingContent.filter(content => 
    content.taskType === taskType && 
    (!difficulty || content.difficulty === difficulty)
  );
  return filtered[Math.floor(Math.random() * filtered.length)];
}

export function getSpeakingContent(part: 1 | 2 | 3, difficulty?: 'easy' | 'medium' | 'hard'): IELTSSpeakingContent {
  const filtered = speakingContent.filter(content => 
    content.part === part && 
    (!difficulty || content.difficulty === difficulty)
  );
  return filtered[Math.floor(Math.random() * filtered.length)];
}
