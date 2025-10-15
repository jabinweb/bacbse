'use client';

import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertCircle, Mail, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Suspense } from 'react';

const errorMessages = {
  OAuthAccountNotLinked: {
    title: 'Account Already Exists',
    description: 'An account with this email address already exists. Please sign in using your original method.',
    suggestion: 'Try signing in with email magic link instead, or contact support if you need help.',
  },
  EmailSignin: {
    title: 'Email Sign-in Error',
    description: 'There was a problem sending the sign-in email.',
    suggestion: 'Please check your email address and try again.',
  },
  Default: {
    title: 'Authentication Error',
    description: 'There was a problem with authentication.',
    suggestion: 'Please try again or contact support if the issue persists.',
  },
};

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error') || 'Default';
  
  const errorInfo = errorMessages[error as keyof typeof errorMessages] || errorMessages.Default;

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <CardTitle className="text-xl text-gray-900">{errorInfo.title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-center">{errorInfo.description}</p>
        <p className="text-sm text-gray-500 text-center">{errorInfo.suggestion}</p>
        
        {error === 'OAuthAccountNotLinked' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Try Email Sign-in</span>
            </div>
            <p className="text-xs text-blue-700">
              This email is registered for magic link sign-in. Use the email option on the login page.
            </p>
          </div>
        )}
        
        <div className="flex flex-col gap-2 pt-4">
          <Button asChild className="w-full">
            <Link href="/auth/login">
              Try Again
            </Link>
          </Button>
          <Button variant="ghost" asChild className="w-full">
            <Link href="/" className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
          </Button>
        </div>
        
        {error && (
          <details className="mt-4">
            <summary className="text-xs text-gray-400 cursor-pointer">Error details</summary>
            <code className="text-xs text-gray-500 mt-1 block">Error: {error}</code>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

export default function AuthError() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Suspense fallback={
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-gray-400" />
            </div>
            <CardTitle className="text-xl text-gray-900">Loading...</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="animate-pulse space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          </CardContent>
        </Card>
      }>
        <AuthErrorContent />
      </Suspense>
    </div>
  );
}