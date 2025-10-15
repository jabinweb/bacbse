'use client';

import { HeaderSkeleton } from '@/components/dashboard/dashboard-skeleton';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useRouter } from 'next/navigation';
import { UserDropdown } from '@/components/dashboard/UserDropdown';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // const loading = 'loading';
  const router = useRouter();

  // if (loading) {
  //   return <HeaderSkeleton />;
  // }

  return (
    <>
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="container px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side - Back button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-2"
              onClick={() => router.push('/')}
            >
              <ChevronLeft className="h-4 w-4" />
              Back to Home
            </Button>

            {/* Right side - User dropdown */}
            {/* <UserDropdown /> */}
          </div>
        </div>
      </header>
      
      <main className="min-h-screen bg-gray-50">
        {children}
      </main>
    </>
  );
}
