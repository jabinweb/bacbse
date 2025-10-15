import { NextRequest } from 'next/server';
import { auth } from '@/auth';

interface UserWithRole {
  id: string;
  role?: string;
}

/**
 * Verify if the request is from an admin user or a cron job
 * This function checks for admin authentication or cron job authorization
 */
export async function verifyAdminOrCron(request: NextRequest): Promise<boolean> {
  try {
    // Check for cron job authorization header (for Vercel cron jobs)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    
    if (cronSecret && authHeader === `Bearer ${cronSecret}`) {
      return true;
    }

    // Check for admin user authentication
    const session = await auth();
    
    if (!session?.user?.id) {
      return false;
    }

    // Check if user has admin role
    const user = session.user as UserWithRole;
    return user.role === 'ADMIN';
    
  } catch (error) {
    console.error('Error verifying admin or cron:', error);
    return false;
  }
}

/**
 * Verify if the current session belongs to an admin user
 */
export async function verifyAdmin(): Promise<boolean> {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return false;
    }

    // Check if user has admin role
    const user = session.user as UserWithRole;
    return user.role === 'ADMIN';
    
  } catch (error) {
    console.error('Error verifying admin:', error);
    return false;
  }
}

type AdminHandler = (request: NextRequest, ...args: unknown[]) => Promise<Response>;

/**
 * Middleware function to protect admin routes
 * Returns unauthorized response if user is not admin
 */
export function createAdminMiddleware(handler: AdminHandler): AdminHandler {
  return async function(request: NextRequest, ...args: unknown[]) {
    const isAuthorized = await verifyAdminOrCron(request);
    
    if (!isAuthorized) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized access' }), 
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
    
    return handler(request, ...args);
  };
}