import type { Metadata, Viewport } from 'next';
import { Inter, Montserrat } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { SessionProvider } from 'next-auth/react';
import { ConnectionStatus } from '@/components/ui/ConnectionStatus';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-heading',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'ScioSprints - Interactive Learning Platform',
  description: 'Revolutionizing student revision with interactive gamified learning',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'ScioSprints',
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: '/favicon.ico',
    apple: '/icon-192x192.png',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#8B5CF6',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${montserrat.variable} font-sans antialiased !pointer-events-auto`}>
        <Script 
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="beforeInteractive"
        />
        <main className="min-h-screen">
          <SessionProvider>
            {children}
            <ConnectionStatus />
          </SessionProvider>
        </main>
      </body>
    </html>
  );
}