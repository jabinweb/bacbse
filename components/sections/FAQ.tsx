'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { Card } from "@/components/ui/card";

const faqs = [
  {
    question: "What age groups is ScioSprints suitable for?",
    answer: "This portal is designed for students in Classes 7 of Bethany Academy. It is designed to support foundational learning and revision through engaging, curriculum-aligned activities."
  },
  {
    question: "Is the content aligned with the school curriculum?",
    answer: "Yes, the content is fully aligned with the school curriculum."
  },
  {
    question: "Can ScioSprints be used in classrooms with teacher tracking?",
    answer: "Yes! Teachers can use these activities in class and also request for reports of how the students are using the portal."
  },
  {
    question: "Is the content aligned with the school curriculum?",
    answer: "Yes, the content is closely aligned with the CBSE curriculum. For ICSE and other boards, we offer custom portals tailored to each school's syllabus and focus areas."
  },
  {
    question: "How does the gamification system work?",
    answer: "We use trusted gamification platforms like Baamboozle, Wordwall, Blooket, Educaplay, and Formative. Students earn points, track progress, and see their rank on leaderboards—making learning both fun and competitive."
  },
  {
    question: "Can parents track progress?",
    answer: "Yes! Our platform includes a Learning Management System where you can monitor activity completion. Each game or quiz has its own leaderboard and performance view."
  },
  {
    question: "What devices can students use to access ScioSprints?",
    answer: "ScioSprints works on mobiles, tablets, laptops, and desktops. For the best experience, a larger screen (tablet or computer) is recommended."
  },
  {
    question: "Can students replay the activities?",
    answer: "Absolutely! Students are encouraged to repeat games and quizzes to reinforce concepts and improve their scores."
  },
  {
    question: "Can ScioSprints be used in classrooms with teacher tracking?",
    answer: "Yes! We offer school-branded portals with features like custom content, teacher dashboards, and class activity reports. Contact us to set up a portal aligned with your school's focus areas."
  },
  {
    question: "What should I do if I find an error or have a question?",
    answer: "If you notice any issue, you can take a screenshot and report it via the contact form or inform your teacher (if using through school). We'll make the correction promptly."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 sm:py-20 bg-background">
      <div className="container mx-auto px-4 sm:px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-8 sm:mb-12 tracking-tight text-gray-900">
          <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
            Frequently Asked Questions
          </span> 💭
        </h2>
        
        <div className="grid md:grid-cols-2 gap-4 max-w-5xl mx-auto">
          {faqs.map((faq, index) => (
            <Card 
              key={index}
              className={`p-6 cursor-pointer transition-all duration-200 hover:shadow-md
                ${openIndex === index ? 'ring-2 ring-brand-blue/20 shadow-lg' : 'hover:bg-accent/50'}
              `}
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
            >
              <div className="flex justify-between items-start gap-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground">
                    {faq.question}
                  </h3>
                  <div className={`
                    overflow-hidden transition-all duration-200
                    ${openIndex === index ? 'max-h-48 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                  `}>
                    <p className="text-foreground/70">
                      {faq.answer}
                    </p>
                  </div>
                </div>
                <div className="text-brand-blue">
                  {openIndex === index ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
