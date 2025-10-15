'use client';

import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import { LoadingScreen } from '@/components/ui/loading-screen';
import { SignIn } from '@/components/auth/sign-in';
import { useEffect, Suspense } from 'react';
import Image from 'next/image';
import Link from 'next/link';

function LoginForm() {
  const { status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (status === 'authenticated') {
      router.push(redirect);
    }
  }, [status, router, redirect]);

  // Show loading while checking auth state
  if (status === 'loading') {
    return <LoadingScreen />;
  }

  // Don't render login form if user is already authenticated
  if (status === 'authenticated') {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Logo and Header */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo.png"
              alt="Scio Labs"
              width={60}
              height={60}
              className="rounded-lg"
            />
          </div>
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="text-muted-foreground">
            Sign in to your account
          </p>
        </div>

        {/* Sign In Component */}
        <SignIn 
          callbackUrl={redirect} 
          title="Sign In"
          showGoogleAuth={true}
          showEmailAuth={true}
        />

        {/* Back to Home */}
        <div className="text-center pt-4">
          <Link 
            href="/"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <LoginForm />
    </Suspense>
  );
}