'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoginDialog } from '@/components/auth/login-dialog';
import { 
  User, 
  CreditCard, 
  Settings, 
  LogOut, 
  School,
  Bell,
  Receipt,
  Home
} from "lucide-react";

export const UserDropdown = () => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  if (!user) {
    // Show a simple Login button that opens the login dialog
    return (
      <div>
        <LoginDialog  callbackUrl='/' />
      </div>
    );
  }

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await signOut({ callbackUrl: '/' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNavigation = (path: string) => {
    router.push(path);
  };

  // Get user display name and initials
  const displayName = user?.name || user?.email?.split('@')[0] || 'User';
  const initials = displayName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
  const userEmail = user?.email || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-2 h-10 px-3">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={user?.image || undefined} 
              alt={displayName}
            />
            <AvatarFallback className="bg-blue-100 text-blue-700 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-56 bg-white border shadow-md">
        <DropdownMenuLabel className="pb-2">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{displayName}</p>
            <p className="text-xs leading-none text-muted-foreground">{userEmail}</p>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => handleNavigation('/dashboard')}
          className="cursor-pointer"
        >
          <Home className="mr-2 h-4 w-4" />
          <span>My Dashboard</span>
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => handleNavigation('/dashboard/profile')}
          className="cursor-pointer"
        >
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleNavigation('/dashboard/subscriptions')}
          className="cursor-pointer"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          <span>My Subscriptions</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleNavigation('/dashboard/payments')}
          className="cursor-pointer"
        >
          <Receipt className="mr-2 h-4 w-4" />
          <span>Payment History</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleNavigation('/dashboard/notifications')}
          className="cursor-pointer"
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>

        {/* Admin Panel access for admin users only */}
        {user?.role === 'ADMIN' && (
          <DropdownMenuItem 
            onClick={() => handleNavigation('/admin')}
            className="cursor-pointer"
          >
            <School className="mr-2 h-4 w-4" />
            <span>Admin Panel</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuItem 
          onClick={() => handleNavigation('/dashboard/settings')}
          className="cursor-pointer"
        >
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleSignOut}
          disabled={isLoading}
          className="cursor-pointer text-red-600 focus:text-red-600"
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoading ? 'Signing out...' : 'Sign out'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserDropdown;