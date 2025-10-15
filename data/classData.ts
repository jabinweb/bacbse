export type Topic = {
  id: string;
  name: string;
  type: 'video' | 'interactive' | 'exercise' | 'audio';
  duration: string;
  completed: boolean;
  content: {
    type: 'external_link' | 'video' | 'pdf' | 'text' | 'interactive_widget' | 'iframe';
    url?: string;
    videoUrl?: string;
    pdfUrl?: string;
    textContent?: string;
    widgetConfig?: Record<string, unknown>;
    iframeUrl?: string;
    iframeHtml?: string;
  };
};

type Chapter = {
  id: string;
  name: string;
  topics: Topic[];
};

type Subject = {
  id: string;
  name: string;
  icon: string;
  color: string;
  isLocked: boolean;
  chapters: Chapter[];
};

type ClassInfo = {
  name: string;
  description: string;
  subjects: Subject[];
};

export const classData: Record<number, ClassInfo> = {
  5: {
    name: 'Class 5',
    description: 'Foundation level learning with interactive content',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Numbers and Operations',
            topics: [
              { 
                id: 'c5-math-ch1-t1', 
                name: 'Large Numbers', 
                type: 'video', 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.youtube.com/watch?v=example1' }
              },
              { 
                id: 'c5-math-ch1-t2', 
                name: 'Place Value', 
                type: 'interactive', 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link', url: 'https://www.khanacademy.org/place-value' }
              },
              { 
                id: 'c5-math-ch1-t3', 
                name: 'Comparing Numbers', 
                type: 'video', 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/comparing-numbers' }
              },
              { 
                id: 'c5-math-ch1-t4', 
                name: 'Practice Questions', 
                type: 'exercise', 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/practice' }
              },
              { 
                id: 'c5-math-ch1-t5', 
                name: 'Interactive Number Game', 
                type: 'interactive', 
                duration: '25 min', 
                completed: false,
                content: { 
                  type: 'iframe', 
                  iframeUrl: 'https://wordwall.net/embed/eea3c9af6e074a2799df04d5b7e2e61a?themeId=21&templateId=69&fontStackId=0',
                  iframeHtml: '<iframe src="https://wordwall.net/embed/eea3c9af6e074a2799df04d5b7e2e61a?themeId=21&templateId=69&fontStackId=0" width="500" height="380" frameborder="0" allowfullscreen></iframe>'
                }
              },
              { 
                id: 'c5-math-ch1-t6', 
                name: 'Blooket Math Quiz', 
                type: 'interactive', 
                duration: '20 min', 
                completed: false,
                content: { 
                  type: 'iframe', 
                  iframeUrl: 'https://www.blooket.com/play',
                  iframeHtml: '<iframe src="https://www.blooket.com/play" width="800" height="600" frameborder="0" allowfullscreen></iframe>'
                }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Basic Arithmetic',
            topics: [
              { 
                id: 'c5-math-ch2-t1', 
                name: 'Addition & Subtraction', 
                type: 'video', 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/addition-subtraction' }
              },
              { 
                id: 'c5-math-ch2-t2', 
                name: 'Multiplication Tables', 
                type: 'audio', 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/multiplication' }
              },
              { 
                id: 'c5-math-ch2-t3', 
                name: 'Division Methods', 
                type: 'interactive', 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link', url: 'https://www.example.com/division' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Our Environment',
            topics: [
              { 
                id: 'c5-science-ch1-t1', 
                name: 'Living and Non-living', 
                type: 'video' as const, 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/living-nonliving' }
              },
              { 
                id: 'c5-science-ch1-t2', 
                name: 'Plants Around Us', 
                type: 'interactive' as const, 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/plants' }
              },
              { 
                id: 'c5-science-ch1-t3', 
                name: 'Animals and Their Homes', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/animals' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Food and Health',
            topics: [
              { 
                id: 'c5-science-ch2-t4', 
                name: 'Healthy Food Habits', 
                type: 'video' as const, 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/healthy-food' }
              },
              { 
                id: 'c5-science-ch2-t5', 
                name: 'Vitamins and Minerals', 
                type: 'interactive' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/vitamins' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Grammar Basics',
            topics: [
              { 
                id: 'c5-english-ch1-t1', 
                name: 'Nouns and Pronouns', 
                type: 'video' as const, 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/nouns-pronouns' }
              },
              { 
                id: 'c5-english-ch1-t2', 
                name: 'Verbs and Adjectives', 
                type: 'interactive' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/verbs-adjectives' }
              },
              { 
                id: 'c5-english-ch1-t3', 
                name: 'Adverbs and Prepositions', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/adverbs-prepositions' }
              },
              { 
                id: 'c5-english-ch1-t4', 
                name: 'Sentence Structure', 
                type: 'exercise' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/sentence-structure' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Composition',
            topics: [
              { 
                id: 'c5-english-ch2-t5', 
                name: 'Paragraph Writing', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/paragraph-writing' }
              },
              { 
                id: 'c5-english-ch2-t6', 
                name: 'Essay Writing', 
                type: 'audio' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/essay-writing' }
              },
              { 
                id: 'c5-english-ch2-t7', 
                name: 'Report Writing', 
                type: 'interactive' as const, 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/report-writing' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: true,
        chapters: [
          {
            id: 'ch1',
            name: 'Our Country',
            topics: [
              { 
                id: 'c5-social-ch1-t1', 
                name: 'States and Capitals', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/states-capitals' }
              },
              { 
                id: 'c5-social-ch1-t2', 
                name: 'Major Rivers', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/major-rivers' }
              },
              { 
                id: 'c5-social-ch1-t3', 
                name: 'Mountains and Plains', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/mountains-plains' }
              }
            ]
          }
        ]
      }
    ]
  },
  6: {
    name: 'Class 6',
    description: 'Intermediate level with advanced concepts',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Integers and Rational Numbers',
            topics: [
              { 
                id: 'c6-math-ch1-t1', 
                name: 'Understanding Integers', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/integers' }
              },
              { 
                id: 'c6-math-ch1-t2', 
                name: 'Rational Numbers', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/rational-numbers' }
              },
              { 
                id: 'c6-math-ch1-t3', 
                name: 'Number Line', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/number-line' }
              },
              { 
                id: 'c6-math-ch1-t4', 
                name: 'Operations on Integers', 
                type: 'exercise' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/integer-operations' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Algebraic Expressions',
            topics: [
              { 
                id: 'c6-math-ch2-t1', 
                name: 'Introduction to Algebra', 
                type: 'video' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/algebra-intro' }
              },
              { 
                id: 'c6-math-ch2-t2', 
                name: 'Variables and Constants', 
                type: 'audio' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/variables-constants' }
              },
              { 
                id: 'c6-math-ch2-t3', 
                name: 'Algebraic Identities', 
                type: 'interactive' as const, 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/algebraic-identities' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Components of Food',
            topics: [
              { 
                id: 'c6-science-ch1-t1', 
                name: 'Carbohydrates', 
                type: 'video' as const, 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/carbohydrates' }
              },
              { 
                id: 'c6-science-ch1-t2', 
                name: 'Proteins and Fats', 
                type: 'interactive' as const, 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/proteins-fats' }
              },
              { 
                id: 'c6-science-ch1-t3', 
                name: 'Vitamins and Minerals', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/vitamins-minerals' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Chemical Reactions',
            topics: [
              { 
                id: 'c6-science-ch2-t4', 
                name: 'Introduction to Chemical Reactions', 
                type: 'video' as const, 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/chemical-reactions' }
              },
              { 
                id: 'c6-science-ch2-t5', 
                name: 'Types of Chemical Reactions', 
                type: 'interactive' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/reaction-types' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Tenses',
            topics: [
              { 
                id: 'c6-english-ch1-t1', 
                name: 'Present Tense', 
                type: 'video' as const, 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/present-tense' }
              },
              { 
                id: 'c6-english-ch1-t2', 
                name: 'Past Tense', 
                type: 'interactive' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/past-tense' }
              },
              { 
                id: 'c6-english-ch1-t3', 
                name: 'Future Tense', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/future-tense' }
              },
              { 
                id: 'c6-english-ch1-t4', 
                name: 'Perfect Tense', 
                type: 'exercise' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/perfect-tense' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Punctuation and Sentence Structure',
            topics: [
              { 
                id: 'c6-english-ch2-t5', 
                name: 'Commas and Full Stops', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/punctuation' }
              },
              { 
                id: 'c6-english-ch2-t6', 
                name: 'Question Marks and Exclamation Points', 
                type: 'audio' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/question-marks' }
              },
              { 
                id: 'c6-english-ch2-t7', 
                name: 'Sentence Fragments and Run-ons', 
                type: 'interactive' as const, 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/sentence-fragments' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Geographical Features',
            topics: [
              { 
                id: 'c6-social-ch1-t1', 
                name: 'Mountains, Valleys, and Plains', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/geographical-features' }
              },
              { 
                id: 'c6-social-ch1-t2', 
                name: 'Rivers, Lakes, and Oceans', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/water-bodies' }
              },
              { 
                id: 'c6-social-ch1-t3', 
                name: 'Deserts and Forests', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/deserts-forests' }
              },
              { 
                id: 'c6-social-ch1-t4', 
                name: 'Climate and Weather', 
                type: 'exercise' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/climate-weather' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Cultural Heritage',
            topics: [
              { 
                id: 'c6-social-ch2-t5', 
                name: 'Famous Monuments', 
                type: 'video' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/monuments' }
              },
              { 
                id: 'c6-social-ch2-t6', 
                name: 'Traditional Dances and Music', 
                type: 'audio' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/traditional-arts' }
              },
              { 
                id: 'c6-social-ch2-t7', 
                name: 'Festivals and Celebrations', 
                type: 'interactive' as const, 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/festivals' }
              }
            ]
          }
        ]
      }
    ]
  },
  7: {
    name: 'Class 7',
    description: 'Advanced curriculum with exam preparation',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Rational Numbers and Proportions',
            topics: [
              { 
                id: 'c7-math-ch1-t1', 
                name: 'Understanding Rational Numbers', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/rational-numbers' }
              },
              { 
                id: 'c7-math-ch1-t2', 
                name: 'Proportions and Ratios', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/proportions' }
              },
              { 
                id: 'c7-math-ch1-t3', 
                name: 'Percentage', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/percentage' }
              },
              { 
                id: 'c7-math-ch1-t4', 
                name: 'Profit and Loss', 
                type: 'exercise' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/profit-loss' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Linear Equations',
            topics: [
              { 
                id: 'c7-math-ch2-t5', 
                name: 'Introduction to Linear Equations', 
                type: 'video' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/linear-equations' }
              },
              { 
                id: 'c7-math-ch2-t6', 
                name: 'Solving Equations', 
                type: 'audio' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/solving-equations' }
              },
              { 
                id: 'c7-math-ch2-t7', 
                name: 'Applications of Linear Equations', 
                type: 'interactive' as const, 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/linear-applications' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Physical and Chemical Changes',
            topics: [
              { 
                id: 'c7-science-ch1-t1', 
                name: 'Understanding Physical Changes', 
                type: 'video' as const, 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/physical-changes' }
              },
              { 
                id: 'c7-science-ch1-t2', 
                name: 'Chemical Reactions in Daily Life', 
                type: 'interactive' as const, 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/chemical-reactions-daily' }
              },
              { 
                id: 'c7-science-ch1-t3', 
                name: 'Acids, Bases, and Salts', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/acids-bases-salts' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Structure of the Atom',
            topics: [
              { 
                id: 'c7-science-ch2-t4', 
                name: 'Introduction to Atomic Structure', 
                type: 'video' as const, 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/atomic-structure' }
              },
              { 
                id: 'c7-science-ch2-t5', 
                name: 'Subatomic Particles', 
                type: 'interactive' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/subatomic-particles' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Active and Passive Voice',
            topics: [
              { 
                id: 'c7-english-ch1-t1', 
                name: 'Understanding Active Voice', 
                type: 'video' as const, 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/active-voice' }
              },
              { 
                id: 'c7-english-ch1-t2', 
                name: 'Understanding Passive Voice', 
                type: 'interactive' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/passive-voice' }
              },
              { 
                id: 'c7-english-ch1-t3', 
                name: 'Changing Voices', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/changing-voices' }
              },
              { 
                id: 'c7-english-ch1-t4', 
                name: 'Exercises on Voice', 
                type: 'exercise' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/voice-exercises' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Direct and Indirect Speech',
            topics: [
              { 
                id: 'c7-english-ch2-t5', 
                name: 'Understanding Direct Speech', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/direct-speech' }
              },
              { 
                id: 'c7-english-ch2-t6', 
                name: 'Understanding Indirect Speech', 
                type: 'audio' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/indirect-speech' }
              },
              { 
                id: 'c7-english-ch2-t7', 
                name: 'Changing Speech Forms', 
                type: 'interactive' as const, 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/speech-forms' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Revolutionary Leaders',
            topics: [
              { 
                id: 'c7-social-ch1-t1', 
                name: 'George Washington', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/george-washington' }
              },
              { 
                id: 'c7-social-ch1-t2', 
                name: 'Mahatma Gandhi', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/mahatma-gandhi' }
              },
              { 
                id: 'c7-social-ch1-t3', 
                name: 'Nelson Mandela', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/nelson-mandela' }
              },
              { 
                id: 'c7-social-ch1-t4', 
                name: 'Winston Churchill', 
                type: 'exercise' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/winston-churchill' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Independence Movements',
            topics: [
              { 
                id: 'c7-social-ch2-t5', 
                name: 'American Revolution', 
                type: 'video' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/american-revolution' }
              },
              { 
                id: 'c7-social-ch2-t6', 
                name: 'French Revolution', 
                type: 'audio' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/french-revolution' }
              },
              { 
                id: 'c7-social-ch2-t7', 
                name: 'Indian Independence', 
                type: 'interactive' as const, 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/indian-independence' }
              }
            ]
          }
        ]
      }
    ]
  },
  8: {
    name: 'Class 8',
    description: 'Pre-board preparation with comprehensive content',
    subjects: [
      {
        id: 'math',
        name: 'Mathematics',
        icon: '🔢',
        color: 'from-blue-400 to-blue-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Exponents and Powers',
            topics: [
              { 
                id: 'c8-math-ch1-t1', 
                name: 'Understanding Exponents', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/exponents' }
              },
              { 
                id: 'c8-math-ch1-t2', 
                name: 'Laws of Exponents', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/laws-exponents' }
              },
              { 
                id: 'c8-math-ch1-t3', 
                name: 'Scientific Notation', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/scientific-notation' }
              },
              { 
                id: 'c8-math-ch1-t4', 
                name: 'Square and Cube Roots', 
                type: 'exercise' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/square-cube-roots' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Polynomials',
            topics: [
              { 
                id: 'c8-math-ch2-t5', 
                name: 'Introduction to Polynomials', 
                type: 'video' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/polynomials-intro' }
              },
              { 
                id: 'c8-math-ch2-t6', 
                name: 'Types of Polynomials', 
                type: 'audio' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/polynomial-types' }
              },
              { 
                id: 'c8-math-ch2-t7', 
                name: 'Operations on Polynomials', 
                type: 'interactive' as const, 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/polynomial-operations' }
              }
            ]
          }
        ]
      },
      {
        id: 'science',
        name: 'Science',
        icon: '🔬',
        color: 'from-green-400 to-green-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Matter and Its Properties',
            topics: [
              { 
                id: 'c8-science-ch1-t1', 
                name: 'States of Matter', 
                type: 'video' as const, 
                duration: '16 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/states-matter' }
              },
              { 
                id: 'c8-science-ch1-t2', 
                name: 'Physical and Chemical Properties', 
                type: 'interactive' as const, 
                duration: '24 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/matter-properties' }
              },
              { 
                id: 'c8-science-ch1-t3', 
                name: 'Changes in States of Matter', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/state-changes' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Atoms and Molecules',
            topics: [
              { 
                id: 'c8-science-ch2-t4', 
                name: 'Introduction to Atoms', 
                type: 'video' as const, 
                duration: '14 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/atoms-intro' }
              },
              { 
                id: 'c8-science-ch2-t5', 
                name: 'Molecules and Compounds', 
                type: 'interactive' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/molecules-compounds' }
              }
            ]
          }
        ]
      },
      {
        id: 'english',
        name: 'English',
        icon: '📚',
        color: 'from-purple-400 to-purple-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Conditional Sentences',
            topics: [
              { 
                id: 'c8-english-ch1-t1', 
                name: 'Zero Conditional', 
                type: 'video' as const, 
                duration: '10 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/zero-conditional' }
              },
              { 
                id: 'c8-english-ch1-t2', 
                name: 'First Conditional', 
                type: 'interactive' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/first-conditional' }
              },
              { 
                id: 'c8-english-ch1-t3', 
                name: 'Second Conditional', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/second-conditional' }
              },
              { 
                id: 'c8-english-ch1-t4', 
                name: 'Exercises on Conditionals', 
                type: 'exercise' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/conditional-exercises' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Reported Speech',
            topics: [
              { 
                id: 'c8-english-ch2-t5', 
                name: 'Introduction to Reported Speech', 
                type: 'video' as const, 
                duration: '20 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/reported-speech-intro' }
              },
              { 
                id: 'c8-english-ch2-t6', 
                name: 'Changing Direct Speech to Reported Speech', 
                type: 'audio' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/direct-to-reported' }
              },
              { 
                id: 'c8-english-ch2-t7', 
                name: 'Exercises on Reported Speech', 
                type: 'interactive' as const, 
                duration: '28 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/reported-speech-exercises' }
              }
            ]
          }
        ]
      },
      {
        id: 'social',
        name: 'Social Studies',
        icon: '🌍',
        color: 'from-orange-400 to-orange-600',
        isLocked: false,
        chapters: [
          {
            id: 'ch1',
            name: 'Global Issues',
            topics: [
              { 
                id: 'c8-social-ch1-t1', 
                name: 'Climate Change', 
                type: 'video' as const, 
                duration: '15 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/climate-change' }
              },
              { 
                id: 'c8-social-ch1-t2', 
                name: 'Pollution', 
                type: 'interactive' as const, 
                duration: '20 min', 
                completed: true,
                content: { type: 'external_link' as const, url: 'https://www.example.com/pollution' }
              },
              { 
                id: 'c8-social-ch1-t3', 
                name: 'Sustainable Development', 
                type: 'video' as const, 
                duration: '12 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/sustainable-development' }
              },
              { 
                id: 'c8-social-ch1-t4', 
                name: 'Conservation of Resources', 
                type: 'exercise' as const, 
                duration: '30 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/resource-conservation' }
              }
            ]
          },
          {
            id: 'ch2',
            name: 'Current Affairs',
            topics: [
              { 
                id: 'c8-social-ch2-t5', 
                name: 'National Events', 
                type: 'video' as const, 
                duration: '18 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/national-events' }
              },
              { 
                id: 'c8-social-ch2-t6', 
                name: 'International Relations', 
                type: 'audio' as const, 
                duration: '25 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/international-relations' }
              },
              { 
                id: 'c8-social-ch2-t7', 
                name: 'Economic Developments', 
                type: 'interactive' as const, 
                duration: '22 min', 
                completed: false,
                content: { type: 'external_link' as const, url: 'https://www.example.com/economic-developments' }
              }
            ]
          }
        ]
      }
    ]
  }
} as const;

export type ClassData = typeof classData;
export type ClassId = keyof ClassData;
// export type Subject = ClassData[ClassId]['subjects'][0];
// export type Chapter = Subject['chapters'][0];
