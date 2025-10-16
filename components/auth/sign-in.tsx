'use client';

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface SignInProps {
  callbackUrl?: string;
  title?: string;
  showGoogleAuth?: boolean;
  showEmailAuth?: boolean;
}

export function SignIn({ 
  callbackUrl = "/dashboard", 
  title = "Sign In",
  showGoogleAuth = true,
  showEmailAuth = true
}: SignInProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await signIn('google', { callbackUrl });
    } catch (error: unknown) {
      console.error('Google Sign-in Error:', error);
      setError('Failed to sign in with Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('🔵 Email sign-in button clicked for email:', email);
    
    try {
      setIsLoading(true);
      setError(null);
      
      // First, get the CSRF token
      console.log('🔵 Fetching CSRF token...');
      const csrfResponse = await fetch('/api/auth/csrf');
      const csrfData = await csrfResponse.json();
      console.log('🔵 CSRF token retrieved:', csrfData.csrfToken ? 'Yes' : 'No');
      
      console.log('🔵 Calling signIn with nodemailer provider...');
      console.log('🔵 Parameters:', { 
        provider: 'nodemailer',
        email,
        callbackUrl,
        redirect: false,
        csrfToken: csrfData.csrfToken
      });
      
      const result = await signIn('nodemailer', { 
        email,
        callbackUrl,
        redirect: false,
        csrfToken: csrfData.csrfToken
      });
      
      console.log('🔵 signIn result:', result);
      
      if (result?.error) {
        console.error('🔴 signIn returned error:', result.error);
        setError('Failed to send sign-in email. Please try again.');
      } else {
        console.log('🟢 signIn successful, email should be sent');
        setEmailSent(true);
        setError(null);
      }
    } catch (error: unknown) {
      console.error('🔴 Email Sign-in Error:', error);
      setError('Failed to send sign-in email');
    } finally {
      setIsLoading(false);
      console.log('🔵 Email sign-in process completed');
    }
  };

  if (emailSent) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Check Your Email</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            We&apos;ve sent a sign-in link to <strong>{email}</strong>
          </p>
          <p className="text-sm text-muted-foreground">
            Click the link in your email to sign in. You can close this window.
          </p>
          <Button 
            variant="outline" 
            onClick={() => {
              setEmailSent(false);
              setEmail('');
            }}
            className="w-full"
          >
            Try Different Email
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-center">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {showGoogleAuth && (
          <>
            <Button 
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white text-gray-800 border hover:bg-gray-50"
            >
              <div className="relative w-5 h-5 mr-2">
                <Image 
                  src="/google.svg" 
                  alt="Google"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              Sign in with Google
            </Button>
            
            {showEmailAuth && (
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                </div>
              </div>
            )}
          </>
        )}

        {showEmailAuth && (
          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            
            {error && <p className="text-red-500 text-sm">{error}</p>}
            
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Send Sign-in Link
            </Button>
            
            <p className="text-xs text-gray-600 text-center">
              We&apos;ll send you a secure link to sign in without a password
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default SignIn;