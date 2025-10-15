'use client';

import { useSession } from 'next-auth/react';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const user = session?.user;
  const userRole = user?.role;
  const loading = status === 'loading';
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login page with admin redirect
      router.push('/auth/login?redirect=/admin');
    } else if (user && userRole && userRole !== 'ADMIN') {
      // Redirect non-admin users to home page
      router.push('/');
    }
  }, [status, router, user, userRole]);

  if (loading || (user && !userRole)) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <LoadingScreen />; // Show loading while redirecting
  }

  // Show access denied if user is not admin
  if (userRole !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p className="text-muted-foreground">You don&apos;t have permission to access the admin area.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
 