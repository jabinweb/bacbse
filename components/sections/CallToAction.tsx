'use client';
import { Button } from "@/components/ui/button";
import { GraduationCap, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useState } from "react";
import { SignupForm } from '../SignupForm';

export function CallToAction() {
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  const [signupRole, setSignupRole] = useState<string | undefined>(undefined);

  const handleEducatorClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSignupRole('admin');
    setIsSignupOpen(true);
  };

  const handleTeacherClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setSignupRole('teacher');
    setIsSignupOpen(true);
  };

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-blue/10 via-transparent to-brand-orange/10" />
      <div className="container mx-auto px-4 sm:px-6 relative">
        <Card className="bg-white/50 backdrop-blur-sm border border-white/20">
          <CardContent className="text-center py-12 px-6">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-center mb-4 tracking-tight text-gray-900">
              <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">Need a Custom Portal?</span> ✨
            </h2>
            <p className="text-lg text-muted-foreground mb-6 sm:mb-8 max-w-2xl mx-auto">
              We build school-branded learning portals tailored to any curriculum or board. Get a platform that fits your classrooms perfectly!
            </p>
            <TooltipProvider>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">               
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="relative">
                      <Button 
                        onClick={handleTeacherClick}
                        className="bg-orange-400 hover:bg-orange-500 text-white rounded-full px-8 py-6 text-lg shadow-lg transform-gpu hover:scale-[1.02] focus:outline-none"
                      >
                        <BookOpen className="mr-2 h-5 w-5" />
                        I am an Educator
                      </Button>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white border-gray-800 shadow-xl px-4 py-2 rounded-lg">
                    Classroom-ready activities and student progress tracking.
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      onClick={handleEducatorClick}
                      variant="outline"
                      className="border-brand-blue text-brand-blue hover:bg-brand-blue/10 rounded-full px-8 py-6 text-lg"
                    >
                      <GraduationCap className="mr-2 h-5 w-5" />
                      I&apos;m a School Admin
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-gray-900 text-white border-gray-800 shadow-xl px-4 py-2 rounded-lg">
                    Custom portals, class reports, and curriculum-aligned resources.
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </CardContent>
        </Card>
      </div>
      {/* Signup Form Dialog */}
      <SignupForm 
        open={isSignupOpen} 
        onOpenChange={setIsSignupOpen}
        initialRole={signupRole}
      />
    </section>
  );
}
