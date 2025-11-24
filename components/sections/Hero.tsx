'use client';

import { ArrowRight, Play } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from "@/components/ui/card";
import Link from 'next/link';
import GetStartedDialog from './GetStarted';

export function Hero() {
  const [getStartedOpen, setGetStartedOpen] = useState(false);

  return (
    <section id="hero" className="relative min-h-[100svh] flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover scale-[1.02]"
        >
          <source
            src="/hero_video.mp4"
            type="video/mp4"
          />
        </video>
        {/* Enhanced Mobile-friendly Gradient Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/40" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,transparent_30%,rgba(0,0,0,0.4)_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-brand-blue/20 via-transparent to-brand-orange/20" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {/* New Badge */}
          <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12 animate-fade-in">
            <div className="inline-block scale-90 sm:scale-100">
              <div className="inline-flex items-center rounded-full border border-white/30 bg-white/5 backdrop-blur-sm p-1 pr-3 sm:pr-4">
                <span className="bg-brand-blue text-white rounded-full px-2 sm:px-3 py-0.5 text-xs sm:text-sm font-medium mr-1.5 sm:mr-2">
                  New
                </span>
                <span className="text-white/90 text-xs sm:text-sm">Interactive Learning Games Added!</span>
              </div>
            </div>

            {/* Hero Title */}
            <h1 className="display mb-6 sm:w-5xl text-4xl md:text-6xl text-gray-200 md:!leading-[5rem] leading-[3rem] font-bold">
              Fun-Fueled Revisions with{' '}
              <span className="bg-gradient-to-r from-brand-blue via-white to-brand-orange bg-clip-text text-transparent">
                ScioSprints!
              </span>{' '}
              <span className="inline-block animate-bounce">🚀</span>
            </h1>
            
            {/* Description */}
            <p className="lead max-w-2xl mx-auto mb-8 text-gray-300">
              Play curriculum‑aligned games, compete with peers, and climb leaderboards—make your revisions fun and rewarding.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4 mb-12 sm:mb-16 animate-fade-in">
            <Button
              size="lg"
              className="bg-brand-blue hover:bg-brand-blue-dark text-white text-lg h-12 px-8 rounded-full"
              onClick={() => setGetStartedOpen(true)}
            >
              Get Started <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 text-lg h-12 px-8 rounded-full"
            >
              <Link href="#games">
              <Play className="mr-2 h-4 w-4" /> Play Now
              </Link>
            </Button>
          </div>
          <GetStartedDialog open={getStartedOpen} onClose={() => setGetStartedOpen(false)} />
          
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto px-4 animate-fade-in">
            {[
              { number: '40+', label: 'Game Formats' },
              { number: '1000+', label: 'Curriculum-Aligned Activities' },
              { number: '100+', label: 'HOTS Challenges' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white/5 backdrop-blur-sm border-white/10 overflow-hidden group">
                <CardContent className="p-4 relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 translate-y-full transform transition-transform duration-300 group-hover:translate-y-0" />
                  <div className="relative">
                    <div className="text-3xl font-bold bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent mb-1">
                      {stat.number}
                    </div>
                    <div className="text-sm text-white/80">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
