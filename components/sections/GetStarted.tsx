'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { LoginDialog } from '@/components/auth/login-dialog';

interface GetStartedProps {
  open: boolean;
  onClose: () => void;
}

export default function GetStartedDialog({ open, onClose }: GetStartedProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [openLogin, setOpenLogin] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  const goToDemo = () => {
    onClose();
    router.push('/demo');
  };

  const goToLoginDialog = () => {
    // If already signed in, go straight to dashboard
    if (session?.user) {
      onClose();
      router.push('/dashboard');
      return;
    }

    // Open the in-page login dialog and keep this modal open until login dialog opens
    setOpenLogin(true);
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* dialog */}
      <div className="relative z-10 w-full max-w-md mx-4 bg-white/95 dark:bg-gray-900 rounded-xl shadow-xl p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Get started</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Choose how you want to begin.</p>

        <div className="space-y-3">
          <Button onClick={goToDemo} size="lg" className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full">
            Start my Free Trial!
          </Button>

          <Button
            onClick={goToLoginDialog}
            size="lg"
            variant="outline"
            className="w-full rounded-full"
            aria-label={session?.user ? 'Go to dashboard' : 'Get full access - Login'}
          >
            {session?.user ? 'Go to My Dashboard' : 'Get full access'}
          </Button>

          <div className="pt-3 text-center">
            <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400">
              Cancel
            </button>
          </div>
        </div>
      </div>
      {/* In-page login dialog; when it closes, also close this GetStarted modal */}
      <LoginDialog defaultOpen={openLogin} onClose={() => { setOpenLogin(false); onClose(); }} />
    </div>
  );
}
