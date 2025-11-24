'use client';

import React from 'react';
import { Gamepad2, BookOpen, Users, Brain, Trophy, Rocket, Target, Book } from 'lucide-react';
import clsx from 'clsx';
import Image from 'next/image';
import { Card, CardHeader, CardContent } from "@/components/ui/card";

type TabContent = {
  id: string;
  label: string;
  icon: React.ReactNode;
};

interface TabSectionProps {
  tabs: TabContent[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

export function TabSection({ tabs, activeTab, onTabChange }: TabSectionProps) {
  return (
    <section className="py-8 sm:py-12 lg:py-20 relative overflow-hidden">
      {/* Background with playful gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/5 via-brand-orange/5 to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(75,157,206,0.1)_0%,transparent_50%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(76,174,84,0.1)_0%,transparent_50%)]" />

      <div className="container mx-auto px-4 sm:px-6 relative">
        {/* Mobile-First Tab Navigation */}
        <div className="mb-6 sm:mb-8 lg:mb-16">
          <div className="flex justify-center">
            <div className="w-full max-w-full overflow-hidden">
              <div className="flex overflow-x-auto pb-2 scrollbar-hide">
                <div className="flex bg-white rounded-xl sm:rounded-2xl p-1 sm:p-2 shadow-lg sm:shadow-xl border border-brand-blue/10 sm:border-2 sm:border-brand-blue/20 gap-1 sm:gap-2 mx-auto min-w-fit">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => onTabChange(tab.id)}
                      className={clsx(
                        "relative group flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 lg:py-3 rounded-lg sm:rounded-xl transition-all duration-300 whitespace-nowrap",
                        "text-xs sm:text-sm lg:text-base font-medium flex-shrink-0",
                        activeTab === tab.id
                          ? "bg-gradient-to-br from-brand-blue to-brand-orange text-white shadow-md sm:shadow-lg scale-105"
                          : "hover:bg-gradient-to-br hover:from-brand-blue/10 hover:to-brand-orange/10 text-gray-600"
                      )}
                    >
                      {/* Icon wrapper with responsive sizing */}
                      <div className={clsx(
                        "relative p-1 sm:p-1.5 lg:p-2 rounded-full transition-transform duration-300",
                        "group-hover:scale-110 group-hover:rotate-3",
                        activeTab === tab.id
                          ? "text-white"
                          : "text-brand-blue group-hover:text-brand-blue"
                      )}>
                        <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5">
                          {tab.icon}
                        </div>
                      </div>
                      
                      {/* Label with responsive text */}
                      <span className="relative font-semibold hidden xs:inline sm:inline">
                        {tab.label}
                      </span>
                      
                      {/* Mobile-only: Show just first word or abbreviation */}
                      <span className="relative font-semibold xs:hidden sm:hidden text-[10px]">
                        {tab.label.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content area with responsive padding and sizing */}
        <div className="relative bg-white/50 backdrop-blur-sm rounded-xl sm:rounded-2xl lg:rounded-3xl p-3 sm:p-6 lg:p-8 shadow-lg sm:shadow-xl border border-white/20 sm:border-2">
          {/* Features Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'features' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0 pointer-events-none'
          )}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              { [
                {
                  icon: <Gamepad2 className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />,
                  title: "Learn Smarter, Play Better",
                  description: "Engaging games and quizzes that make learning fun, interactive, and rewarding."
                },
                {
                  icon: <Brain className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />,
                  title: "Think Sharp, Stay Ahead",
                  description: "Boost critical thinking and retention through challenge-based, concept-driven modules."
                },
                {
                  icon: <BookOpen className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />,
                  title: "Syllabus Simplified",
                  description: "Aligned with CBSE curriculum offering chapter-wise learning activities."
                }
              ].map((feature, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur-sm border border-white/20 hover:shadow-lg sm:hover:shadow-xl transition-all duration-200">
                  <CardHeader className="p-4 sm:p-6">
                    <div className="mb-3 sm:mb-4">{feature.icon}</div>
                    <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-brand-blue leading-tight">{feature.title}</h3>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6 pt-0">
                    <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Curriculum Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'curriculum' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0 pointer-events-none'
          )}>
            <div className="bg-background rounded-xl sm:rounded-2xl p-4 sm:p-6 lg:p-8 shadow-lg">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                <div className="order-2 lg:order-1">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4 sm:mb-6 text-primary">Comprehensive Curriculum Coverage</h3>
                  <ul className="space-y-3 sm:space-y-4">
                    { [
                      "CBSE : Classes 4–8",
                      "Subject & Chapter-wise Activities",
                      "Covers Key Terms & Concepts",
                      "HOTS Questions for Deeper Thinking",
                    ].map((item, index) => (
                      <li key={index} className="flex items-center gap-3 text-sm sm:text-base lg:text-lg">
                        <div className="bg-primary/10 p-1.5 sm:p-2 rounded-full flex-shrink-0">
                          <Book className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-primary" />
                        </div>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="relative h-48 sm:h-64 lg:h-[300px] rounded-xl overflow-hidden order-1 lg:order-2">
                  <Image
                    src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80"
                    alt="Students studying"
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Benefits Tab Content */}
          <div className={clsx(
            'tab-content transition-all duration-300',
            activeTab === 'benefits' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 absolute top-0 left-0 right-0 pointer-events-none'
          )}>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-6 lg:gap-8">
              { [
                {
                  icon: <Target className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary" />,
                  title: "Improved Focus",
                  description: "Gamified challenges keep learners engaged and attentive."
                },
                {
                  icon: <Brain className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary" />,
                  title: "Better Retention",
                  description: "Interactive activities boost memory and deepen understanding."
                },
                {
                  icon: <Trophy className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary" />,
                  title: "Confidence Boost",
                  description: "Progress tracking and rewards build learner confidence."
                },
                {
                  icon: <Users className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary" />,
                  title: "Peer Learning",
                  description: "Collaborative features encourage group interaction and learning."
                },
                {
                  icon: <Rocket className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary" />,
                  title: "Faster Progress",
                  description: "Milestone-based tracking accelerates learning outcomes."
                },
                {
                  icon: <BookOpen className="w-8 h-8 sm:w-9 sm:h-9 lg:w-10 lg:h-10 text-primary" />,
                  title: "Complete Coverage",
                  description: "Covers the entire curriculum through fun, bite-sized revision."
                }
              ].map((benefit, index) => (
                <Card key={index} className="bg-white/50 backdrop-blur-sm border border-white/20 group hover:shadow-lg sm:hover:shadow-xl transition-all duration-200">
                  <CardHeader className="p-4 sm:p-5 lg:p-6">
                    <div className="bg-brand-blue/10 w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 rounded-full flex items-center justify-center mb-3 sm:mb-4 group-hover:bg-brand-blue/20 transition-colors">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold mb-2 text-brand-blue leading-tight">{benefit.title}</h3>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-5 lg:p-6 pt-0">
                    <p className="text-sm sm:text-base text-gray-600">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
