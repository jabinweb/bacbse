'use client';

import React from 'react';
import { Button } from "@/components/ui/button";
import Image from 'next/image';

interface LogoProps {
  isScrolled: boolean;
  onClick?: () => void;
}

export const Logo = ({ onClick }: LogoProps) => {
  return (
    <Button 
      variant="ghost" 
      onClick={onClick}
      className="p-0 hover:bg-transparent"
    >
      <div className="relative w-[200px] h-12">
        <Image
          src="/logo.png"
          alt="ScioLabs Logo"
          fill
          priority
          className="object-contain object-left"
          sizes="(max-width: 768px) 150px, 200px"
        />
      </div>
    </Button>
  );
};
