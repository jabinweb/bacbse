'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Settings, 
  MessageSquare,
  BookOpen,
  GraduationCap,
  ChevronLeft,
  School,
  DollarSign,
  AlertTriangle,
  Bell,
  Megaphone,
  Activity,
  LogOut
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Schools', href: '/admin/schools', icon: School },
  { name: 'Users', href: '/admin/users', icon: Users },
  { name: 'Classes', href: '/admin/classes', icon: GraduationCap },
  { name: 'Subscriptions', href: '/admin/subscriptions', icon: CreditCard },
  { name: 'Payments', href: '/admin/payments', icon: DollarSign },
  { name: 'Activities', href: '/admin/activities', icon: Activity },
  { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  { name: 'Announcements', href: '/admin/announcements', icon: Megaphone },
  { name: 'Error Logs', href: '/admin/error-logs', icon: AlertTriangle },
  { name: 'Responses', href: '/admin/responses', icon: MessageSquare },
  { name: 'Analytics', href: '/admin/analytics', icon: BookOpen },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="hidden md:flex md:w-64 md:flex-col">
      <div className="flex flex-col flex-grow pt-5 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="flex items-center flex-shrink-0 px-4 mb-6">
          <BookOpen className="h-8 w-8 text-blue-600" />
          <span className="ml-2 text-xl font-semibold">Admin Panel</span>
        </div>
        
        <div className="px-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-2 w-full justify-start"
            onClick={() => router.push('/')}
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Home
          </Button>
        </div>
        
        <div className="mt-5 flex-grow flex flex-col">
          <nav className="flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                    isActive
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <item.icon
                    className={cn(
                      'mr-3 flex-shrink-0 h-5 w-5',
                      isActive ? 'text-blue-500' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          {/* Logout Button */}
          <div className="px-2 pb-4">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 w-full justify-start text-gray-600 hover:bg-red-50 hover:text-red-600"
              onClick={() => signOut({ callbackUrl: '/' })}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
