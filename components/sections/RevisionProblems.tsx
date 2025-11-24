'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Card, CardContent } from "@/components/ui/card";

interface ProblemItem {
  id: string;
  description: string;
  emoji: string;
  bgColor: string;
}

const problemItems: ProblemItem[] = [
  {
    id: 'rote',
    description: ' Rote learning and worksheets often feel like a burden, not true learning.',
    emoji: '📚',
    bgColor: 'bg-blue-50',
  },
  {
    id: 'memory',
    description: 'Children quickly forget concepts, leading to short-term cramming without lasting memory.',
    emoji: '⏳',
    bgColor: 'bg-orange-50',
  },
  {
    id: 'motivation',
    description: 'Parents constantly struggle to keep children attentive, focused, and truly motivated.',
    emoji: '😕',
    bgColor: 'bg-yellow-50',
  },
  {
    id: 'results',
    description: 'Despite hours of study, exam results often fail to reflect effort.',
    emoji: '🎯',
    bgColor: 'bg-purple-50',
  },
];

export function RevisionProblems() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  const imageVariants = {
    hidden: { opacity: 0, scale: 0.9 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section className="py-12 md:py-20 bg-white relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative max-w-7xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-2 bg-red-50 rounded-full border border-red-100 mb-4 md:mb-6">
            <span className="text-lg md:text-xl">😣</span>
            <span className="text-xs md:text-sm font-medium text-red-700">The Problem</span>
          </div>
          
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900 px-4">
            <span className="bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
              Why does revision feel hard?
            </span>
          </h2>
        </motion.div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 lg:gap-16 items-center">
          {/* Left Column - Problems */}
          <motion.div 
            className="space-y-3 md:space-y-4 order-2 lg:order-1"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {problemItems.map((item) => (
              <motion.div
                key={item.id}
                variants={cardVariants}
                whileHover={{ 
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <Card className="shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4 md:p-6">
                    <div className="flex items-start gap-3 md:gap-4">
                      {/* Emoji Icon */}
                      <div className={`flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-xl ${item.bgColor} flex items-center justify-center text-xl md:text-2xl`}>
                        {item.emoji}
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1">
                        <p className="text-gray-700 leading-relaxed font-medium text-sm md:text-base lg:text-lg">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Right Column - Image with Blob Effect */}
          <motion.div 
            className="relative flex justify-center items-center"
            variants={imageVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Blob container */}
            <div className="relative w-96 h-96">
              {/* Animated blob shape background */}
              <motion.div
                className="absolute inset-0 z-10"
                animate={{
                  borderRadius: [
                    "60% 40% 30% 70%/60% 30% 70% 40%",
                    "30% 60% 70% 40%/50% 60% 30% 60%",
                    "60% 40% 30% 70%/60% 30% 70% 40%"
                  ]
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
                style={{
                  background: "linear-gradient(45deg, rgba(164, 199, 255, 0.7), rgba(147, 197, 253, 0.8))"
                }}
              />
              
              {/* Image positioned to overflow blob */}
              <div className="absolute -inset-16 z-20">
                <Image
                  src="/5.png"
                  alt="Stressed student struggling with traditional revision methods"
                  width={600}
                  height={600}
                  className="object-contain w-full h-full scale-110"
                  priority
                  quality={95}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom transition element */}
        <motion.div 
          className="text-center mt-20"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-full border border-orange-200">
            <span className="text-base font-medium text-orange-700">But it doesn&apos;t have to be this way...</span>
            <motion.span 
              className="text-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            >
              💡
            </motion.span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}