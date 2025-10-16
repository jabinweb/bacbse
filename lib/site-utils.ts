// Utility to dynamically get the current site URL
export function getCurrentSiteUrl(): string {
  // For client-side
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  
  // For server-side, check environment variables in order of preference
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }
  
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }
  
  // Fallback to localhost for development
  return 'http://localhost:3000';
}

// Utility to get dynamic callback URL
export function getDynamicCallbackUrl(path: string = '/dashboard'): string {
  const siteUrl = getCurrentSiteUrl();
  return `${siteUrl}${path}`;
}

// Utility to check if we're in production
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

// Utility to get the current domain/host
export function getCurrentHost(): string {
  if (typeof window !== 'undefined') {
    return window.location.host;
  }
  
  // For server-side
  return new URL(getCurrentSiteUrl()).host;
}