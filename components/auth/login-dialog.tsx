"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription
} from "@/components/ui/dialog";
import { useSession, signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import Image from "next/image";

interface LoginDialogProps {
  defaultOpen?: boolean;
  onClose?: () => void;
  callbackUrl?: string;
}

// Custom SignIn content component for dialog use
function SignInContent({ callbackUrl = '/dashboard' }: { callbackUrl?: string }) {
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
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await signIn('nodemailer', { 
        email,
        callbackUrl,
        redirect: false
      });
      
      if (result?.error) {
        setError('Failed to send sign-in email. Please try again.');
      } else {
        setEmailSent(true);
        setError(null);
      }
    } catch (error: unknown) {
      console.error('Email Sign-in Error:', error);
      setError('Failed to send sign-in email');
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="text-center space-y-4">
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
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
      
      <div className="relative my-6">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">Or continue with email</span>
        </div>
      </div>

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
    </div>
  );
}

export function LoginDialog({ defaultOpen = false, onClose, callbackUrl = '/dashboard' }: LoginDialogProps) {
  const [open, setOpen] = useState(defaultOpen);
  const { data: session } = useSession();
  const router = useRouter();

  // When the user is already logged in, don't show dialog and redirect
  useEffect(() => {
    if (session?.user && defaultOpen) {
      setOpen(false);
      router.push(callbackUrl);
    }
  }, [session, defaultOpen, router, callbackUrl]);

  useEffect(() => {
    setOpen(defaultOpen);
  }, [defaultOpen]);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen && onClose) {
      onClose();
    }
  };

  const handleButtonClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent dialog from opening
    if (session?.user) {
      router.push(callbackUrl);
    } else {
      setOpen(true);
    }
  };

  return (
    <Dialog open={open && !session?.user} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          className="rounded-full"
          onClick={handleButtonClick}
        >
          {session?.user ? 'Dashboard' : 'Sign In'}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[400px] p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-center">
            Welcome Back
          </DialogTitle>
          <DialogDescription className="text-center">
            Sign in to continue to your dashboard
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Custom SignIn implementation without Card wrapper */}
          <SignInContent callbackUrl={callbackUrl} />
        </div>
      </DialogContent>
    </Dialog>
  );
}