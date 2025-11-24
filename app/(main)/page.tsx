import React from 'react';
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: 'ScioSprints – CBSE Class 4–8 Gamified Revision (Play & Learn)',
  description: 'Make CBSE revision fun for Classes 4–8 with curriculum aligned games, leaderboards, and progress tracking. Try free demos learn faster, score better.'
};
import { Hero } from '@/components/sections/Hero';
import ClassesTiles from '@/components/sections/ClassesTiles';
import { CallToAction } from '@/components/sections/CallToAction';
import { FAQ } from '@/components/sections/FAQ';
// import { DemoVideo } from '@/components/DemoVideo';
import { TryGamesSection } from '@/components/sections/TryGamesSection';
import { ScioSprintsPromise } from '@/components/sections/ScioSprintsPromise';
import { RevisionProblems } from '@/components/sections/RevisionProblems';
import Image from 'next/image';

export default function Home() {


  const platforms = [
    { 
      name: "Baamboozle", 
      logo: "/logos/baamboozle.svg",
      url: "#"
    },
    { 
      name: "Gimkit", 
      logo: "/logos/gimkit.svg",
      url: "#"
    },
    { 
      name: "Wordwall", 
      logo: "/logos/wordwall.png",
      url: "#"
    },
    { 
      name: "Blooket", 
      logo: "/logos/blooket.png",
      url: "#"
    },
    { 
      name: "Educaplay", 
      logo: "/logos/educaplay.svg",
      url: "#"
    },
    { 
      name: "Formative", 
      logo: "/logos/formative.svg",
      url: "#"
    }
  ];

  return (
    <>
      <div className="bg-background">
      {/* Hero Section */}
      <Hero />
         {/* Problem Section */}
        {/* <RevisionProblems /> */}
        {/* Promise Section */}
        <ScioSprintsPromise />
        {/* Games Section */}
        {/* <TryGamesSection />    */}
        {/* Classes tiles section */}
        {/* <ClassesTiles /> */}
        {/* Platforms Section */}
        {/* <section id="platforms" className="py-20 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-r from-brand-blue/20 via-transparent to-brand-orange/20" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,196,0.1)_0%,transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(245,158,11,0.1)_0%,transparent_50%)]" />
          </div>

          <div className="container mx-auto px-6 relative">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900">
                <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">Multi-Platform Learning</span> 🎮
              </h2>
              <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                Learn and play across trusted educational platforms, all in one place.
              </p>
            </div>

            <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-8 max-w-4xl mx-auto">
              {platforms.map((platform, index) => (
                <a
                  key={index}
                  href={platform.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative bg-white/50 backdrop-blur-sm p-6 rounded-2xl hover:shadow-xl transition-all duration-300 border-2 border-white/20 overflow-hidden flex items-center justify-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 to-brand-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative h-12 w-full transition-all duration-300 group-hover:scale-110">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Image
                        src={platform.logo}
                        alt={`${platform.name} logo`}
                        fill
                        className="object-contain [filter:brightness(0)_saturate(100%)_invert(45%)_sepia(22%)_saturate(791%)_hue-rotate(170deg)_brightness(97%)_contrast(87%)] group-hover:[filter:brightness(0)_saturate(100%)_invert(48%)_sepia(96%)_saturate(427%)_hue-rotate(157deg)_brightness(91%)_contrast(91%)] transition-all duration-300"
                      />
                    </div>
                  </div>

                  <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-gradient-to-br from-brand-blue/20 to-brand-orange/20 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </a>
              ))}
            </div>
          </div>
        </section> */}
        {/* CTA Section */} 
        <section id="cta">
        <CallToAction />
        </section>
        {/* FAQ Section */}
        <section id="faq">
          <FAQ />
        </section>

      </div>
    </>
  );
}