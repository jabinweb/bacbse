'use client';

import { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showMessage, setShowMessage] = useState(false);

  useEffect(() => {
    function updateOnlineStatus() {
      setIsOnline(navigator.onLine);
      setShowMessage(true);
      setTimeout(() => setShowMessage(false), 3000);
    }

    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  if (!showMessage) return null;

  return (
    <div className={`
      fixed bottom-4 left-4 z-50 
      flex items-center gap-2 p-3 rounded-lg
      transition-all duration-300
      ${isOnline ? 'bg-green-500' : 'bg-red-500'}
      text-white shadow-lg
    `}>
      {isOnline ? (
        <Wifi className="w-4 h-4" />
      ) : (
        <WifiOff className="w-4 h-4" />
      )}
      <span className="text-sm font-medium">
        {isOnline ? 'Back online' : 'Currently offline'}
      </span>
    </div>
  );
}
