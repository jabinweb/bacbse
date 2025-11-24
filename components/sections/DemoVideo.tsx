'use client';

import { PlayCircle } from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export function DemoVideo() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="py-12 sm:py-20 bg-gradient-to-b from-transparent via-black/5 to-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-4xl font-bold mb-3 sm:mb-4 px-4">
            <span className=' bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent '>Experience ScioSprints in Action</span> ✨
          </h2>
          <p className="text-base sm:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            See how interactive learning comes alive through our gamified platform.
          </p>
        </div>

        {/* Video Preview */}
        <div className="relative max-w-4xl mx-auto rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/20">
          <div className="aspect-video bg-orange-100 relative group cursor-pointer"
               onClick={() => setIsOpen(true)}>
            {/* Thumbnail Image */}
            <div className="relative w-full h-full">
              <Image
                src="https://images.unsplash.com/photo-1610484826967-09c5720778c7"
                alt="Platform demo"
                fill
                priority
                className="object-cover group-hover:brightness-75 transition-all"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1100px"
              />
            </div>
            
            {/* Play Button Overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Button 
                variant="ghost"
                size="icon"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/90 hover:bg-white group"
              >
                <PlayCircle className="w-8 h-8 sm:w-12 sm:h-12 text-brand-blue group-hover:scale-110 transition-transform" />
              </Button>
            </div>
          </div>

          {/* Features List - Mobile Responsive */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 sm:p-6">
            <div className="flex-wrap justify-center gap-2 sm:gap-4 hidden md:flex">
              {["Interactive Quizzes", "Real-time Progress", "Gamified Learning"].map((feature, index) => (
                <div key={index} className="inline-flex items-center backdrop-blur-sm bg-white/5 rounded-full px-3 sm:px-4 py-1.5 sm:py-2">
                  <span className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-brand-blue rounded-full" />
                  <span className="ml-2 text-sm sm:text-base text-white/90">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Video Modal - Full Screen on Mobile */}
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="max-w-[calc(100vw-32px)] sm:max-w-4xl p-0 bg-black overflow-hidden">
            <DialogHeader>
              <DialogTitle className="sr-only">ScioLabs Platform Demo Video</DialogTitle>
            </DialogHeader>
            <div className="aspect-video w-full">
              <iframe
                width="100%"
                height="100%"
                src="https://www.youtube.com/embed/aKKIdJNU6TI"
                title="ScioLabs Demo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="border-0"
              />
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
