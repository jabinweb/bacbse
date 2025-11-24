'use client';

import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { 
  GamepadIcon, 
  TrendingUp, 
  BookCheck, 
  Target, 
  Trophy, 
  Brain
} from "lucide-react";


interface PromiseItem {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const promiseItems: PromiseItem[] = [
  {
    id: 'fun',
    title: 'Fun with a Purpose',
    description: 'Games turn revision into something children actually enjoy.',
    icon: <GamepadIcon className="w-6 h-6" />,
    color: 'from-blue-500 to-purple-600',
  },
  {
    id: 'grades',
    title: 'Better grades!',
    description: 'Builds reasoning and recall that reflect in exam performance.',
    icon: <TrendingUp className="w-6 h-6" />,
    color: 'from-green-500 to-emerald-600',
  },
  {
    id: 'curriculum',
    title: 'Curriculum Coverage',
    description: '100% CBSE-aligned for Classes 4–8, chapter by chapter.',
    icon: <BookCheck className="w-6 h-6" />,
    color: 'from-orange-500 to-red-600',
  },
  {
    id: 'concepts',
    title: 'Concept Clarity',
    description: 'Covers key terms, concepts, and Higher Order Thinking Skills questions.',
    icon: <Target className="w-6 h-6" />,
    color: 'from-purple-500 to-pink-600',
  },
  {
    id: 'confidence',
    title: 'Confidence that Lasts',
    description: 'Rewards and progress tracking keep learners motivated and exam-ready.',
    icon: <Trophy className="w-6 h-6" />,
    color: 'from-yellow-500 to-orange-600',
  },
  {
    id: 'memory',
    title: 'Sharper Memory',
    description: 'Activities designed for better recall and lasting understanding.',
    icon: <Brain className="w-6 h-6" />,
    color: 'from-indigo-500 to-blue-600',
  },
];

export function ScioSprintsPromise() {
  return (
    <section className="py-12 md:py-20 bg-gradient-to-b from-gray-50 to-gray-100 relative overflow-hidden" id="promise">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      <div className="absolute top-10 left-20 w-32 h-32 bg-brand-blue/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-brand-orange/10 rounded-full blur-3xl" />
      
      <div className="container mx-auto px-4 md:px-6 relative">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900">
            <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
              The ScioSprints Promise
            </span>
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            We know revision can feel stressful — for both children and parents. That&apos;s why ScioSprints makes it simple, engaging, and effective, ensuring better focus, stronger memory, and improved grades.
          </p>
        </div>

        {/* Promise Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {promiseItems.map((item) => (
            <Card 
              key={item.id} 
              className="group hover:shadow-xl transition-all duration-300 border-0 bg-white/90 backdrop-blur-sm hover:-translate-y-1 shadow-md"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r ${item.color} flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    {item.icon}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1">
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2 group-hover:text-brand-blue transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-gray-500 leading-relaxed font-medium text-sm md:text-base lg:text-lg">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bottom accent */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200">
            <div className="w-2 h-2 bg-gradient-to-r from-brand-blue to-brand-orange rounded-full animate-pulse" />
            <span className="text-sm font-medium text-gray-600">Trusted by educators nationwide</span>
          </div>
        </div>
      </div>
    </section>
  );
}