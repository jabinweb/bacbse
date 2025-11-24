
'use client';

import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Play, Globe, Palette, Heart, MapPin, BookOpen, Type } from 'lucide-react';

interface GameData {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  icon: React.ReactNode;
  iframe: {
    src: string;
    width: number;
    height: number;
    allow?: string;
  };
  color: string;
}

const gamesData: GameData[] = [
  {
    id: 'formative',
    title: 'Parts of Speech',
    description: 'Identify the parts of speech of these words.',
    category: 'Practice',
    difficulty: 'Medium',
    icon: <Play className="w-5 h-5" />,
    iframe: {
      src: 'https://app.formative.com/practice/sets/66a095aea044d0b8279f9d29',
      width: 100,
      height: 600,
      allow: 'fullscreen',
    },
    color: 'from-gray-700 to-gray-900',
  },
  {
    id: 'countries',
    title: 'Countries & Capitals',
    description: 'Match the countries with their capitals before time runs out!',
    category: 'Geography',
    difficulty: 'Medium',
    icon: <Globe className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97069/953/922',
      width: 500,
      height: 380,
    },
    color: 'from-blue-600 to-blue-700',
  },
  {
    id: 'colors',
    title: 'Colour Search',
    description: 'Find the names of the colours hidden in this wordsearch grid.',
    category: 'Vocabulary',
    difficulty: 'Easy',
    icon: <Palette className="w-5 h-5" />,
    iframe: {
      src: 'https://www.educaplay.com/game/25247811-color_quest_word_search.html',
      width: 795,
      height: 690,
      allow: 'fullscreen; autoplay; allow-top-navigation-by-user-activation',
    },
    color: 'from-orange-500 to-orange-600',
  },
  {
    id: 'emotions',
    title: 'Emotions',
    description: 'Can you rearrange the words and find the names of emotions?',
    category: 'Social Learning',
    difficulty: 'Easy',
    icon: <Heart className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97070/887/862',
      width: 500,
      height: 380,
    },
    color: 'from-blue-500 to-orange-500',
  },
  {
    id: 'cities',
    title: 'Indian Cities',
    description: 'Guess the names of these cities using the clues given.',
    category: 'Geography',
    difficulty: 'Medium',
    icon: <MapPin className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97070/306/480',
      width: 500,
      height: 380,
    },
    color: 'from-orange-600 to-orange-700',
  },
  {
    id: 'verbs',
    title: 'Irregular Verbs',
    description: 'Test your English skills by hitting the moles, the irregular verbs!',
    category: 'Language',
    difficulty: 'Hard',
    icon: <BookOpen className="w-5 h-5" />,
    iframe: {
      src: 'https://wordwall.net/embed/play/97071/185/784',
      width: 500,
      height: 380,
    },
    color: 'from-blue-700 to-blue-800',
  },
  {
    id: 'speech',
    title: 'Adjectives or Adverbs',
    description: 'Is it an adjective or an adverb, or both?',
    category: 'Language',
    difficulty: 'Medium',
    icon: <Type className="w-5 h-5" />,
    iframe: {
      src: 'https://www.educaplay.com/game/25247848-noun_adjective_adverb_sentences.html',
      width: 795,
      height: 690,
      allow: 'fullscreen; autoplay; allow-top-navigation-by-user-activation',
    },
    color: 'from-orange-500 to-blue-600',
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Easy':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'Medium':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    case 'Hard':
      return 'bg-red-100 text-red-700 border-red-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
};

export const TryGamesSection: React.FC = () => {
  return (
    <section id="games" className="py-24 bg-gradient-to-b from-slate-50/50 to-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-20 left-10 w-32 h-32 bg-brand-blue/20 rounded-full blur-3xl opacity-30" />
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-brand-orange/20 rounded-full blur-3xl opacity-30" />
      
      <div className="container mx-auto px-6 relative">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 mb-6">
            <Play className="w-4 h-4 text-brand-blue" />
            <span className="text-sm font-medium text-gray-600">Interactive Learning</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              Try Our Games
            </span>
          </h2>
          
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Jump in and explore! Play a few sample games to see how ScioSprints works — quick, fun, and easy.
          </p>
        </div>

        {/* Games Tabs */}
        <div className="max-w-7xl mx-auto">
          <Tabs defaultValue="countries" className="w-full">
            {/* Tab Content */}
            {gamesData.map((game) => (
              <TabsContent key={game.id} value={game.id} className="mt-8">
                <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm overflow-hidden">
                  <CardHeader className={`bg-gradient-to-r ${game.color} text-white relative overflow-hidden`}>
                    {/* Header background pattern */}
                    <div className="absolute inset-0 bg-white/10 bg-grid-pattern" />
                    
                    <div className="relative">
                      {/* Tab Navigation - Inside the header */}
                      <div className="flex justify-center mb-6">
                        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-1 bg-white/20 backdrop-blur-sm border border-white/30 shadow-sm rounded-2xl p-2 h-auto">
                          {gamesData.map((gameTab) => (
                            <TabsTrigger
                              key={gameTab.id}
                              value={gameTab.id}
                              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl data-[state=active]:bg-white/30 data-[state=active]:shadow-sm transition-all duration-200 group min-h-[80px] text-center"
                            >
                              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/20 group-data-[state=active]:bg-white/40 transition-colors">
                                <div className="text-white/80 group-data-[state=active]:text-white transition-colors">
                                  {gameTab.icon}
                                </div>
                              </div>
                              <span className="text-xs font-medium text-white/80 group-data-[state=active]:text-white leading-tight">
                                {gameTab.title}
                              </span>
                            </TabsTrigger>
                          ))}
                        </TabsList>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="mb-4 text-center">
                            <div className="flex items-center justify-center gap-3 mb-2">
                              <Badge variant="secondary" className={`${getDifficultyColor(game.difficulty)} border text-sm py-1 px-2`}>
                                {game.difficulty}
                              </Badge>
                              <p className="text-white/90 text-sm font-medium">
                                {game.category}
                              </p>
                            </div>
                            <p className="text-white/90 text-xl md:text-xl leading-relaxed mx-auto max-w-2xl">
                              {game.description}
                            </p>
                          </div>
                    
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="p-0">
                    <div className="w-full h-[600px]">
                      <iframe
                        src={game.iframe.src}
                        frameBorder="0"
                        allowFullScreen
                        allow={game.iframe.allow}
                        className="w-full h-full"
                        style={{
                          minHeight: '600px',
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
};
