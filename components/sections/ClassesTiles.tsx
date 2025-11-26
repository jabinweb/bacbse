'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useRouter } from 'next/navigation';

interface ClassItem {
  id: number | string;
  name: string;
  description?: string;
  price?: number | string; // in paise or formatted
}

// Helper to get a unique icon for each class
function getClassIcon(className: string) {
  const match = className.match(/Class\s*(\d+)/);
  const classNum = match ? match[1] : null;
  switch (classNum) {
    case '4':
      return '🦉';
    case '5':
      return '🦁';
    case '6':
      return '🐯';
    case '7':
      return '🐬';
    case '8':
      return '🦅';
    default:
      return '📚';
  }
}

export default function ClassesTiles() {
  const [classes, setClasses] = useState<ClassItem[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    let mounted = true;
    const fetchClasses = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/admin/classes');
        if (!res.ok) throw new Error('Failed to fetch classes');
        const data = await res.json();
        if (mounted) {
          setClasses(Array.isArray(data) ? data : []);
        }
      } catch (err: unknown) {
        console.error(err);
        if (mounted) setError((err as Error).message || 'Error loading classes');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchClasses();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="py-8 text-center">Loading classes...</div>;
  if (error) return <div className="py-8 text-center text-red-600">{error}</div>;
  if (!classes || classes.length === 0) return <div className="py-8 text-center">No classes available</div>;

  return (
    <section id="classes" className="py-12 text-center">
      <div className="container mx-auto px-6">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 tracking-tight text-gray-900 px-4">
          <span className="bg-gradient-to-r from-brand-blue to-brand-orange bg-clip-text text-transparent">
            Start your journey
          </span>
        </h2>
        <p className="text-base md:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed mb-10">
            Choose your classroom and dive straight into an exciting journey of lessons, activities, and challenges designed just for you.
        </p>
        <div className="flex justify-center px-4">
          <div className="flex flex-wrap gap-4 justify-center max-w-5xl">
            {classes.map((c) => (
              <Card
                key={c.id}
                className="relative cursor-pointer text-center py-4 px-8 flex items-center justify-center hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/dashboard/class/${c.id}`)}
                role="button"
                aria-label={`Open class ${c.name}`}
              >
                {/* Price badge (top-right) */}
                {/* {c.price !== undefined && c.price !== null && (
                  <div className="absolute top-1 right-1">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/95 text-sm font-semibold text-gray-800 shadow">
                      {formatINR(c.price)}/year
                    </span>
                  </div>
                )} */}

                <CardContent className="p-0 space-y-2">
                  <span className='text-5xl'>{getClassIcon(c.name)}</span>
                  <div className="text-lg font-medium">{c.name}</div>
                  {/* {c.price !== undefined && c.price !== null && (
                    <div className="text-sm text-gray-600 mt-1">
                      {formatINR(c.price)}
                    </div>
                  )} */}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Two info boxes side-by-side: pricing and refund */}
        <div className="mt-8 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
            {/* Pricing box */}
            <div className="flex items-center gap-4 p-4 bg-white/90 border border-gray-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0">
                {/* Price tag SVG icon */}
                <div className="w-12 h-12 rounded-md bg-brand-blue/10 text-brand-blue flex items-center justify-center">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 .587l2.668 5.412L20.5 6.9l-4.25 3.89L17.34 17 12 14.2 6.66 17l1.09-6.21L3.5 6.9l5.832-0.901L12 .587z" fill="currentColor" />
                  </svg>
                  <span className="sr-only">Try ScioSprints trial</span>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">Try It Your Way!</h3>
                <p className="mt-1 text-sm text-gray-700">You can start with a single subject for <span className="font-medium">₹299/year</span> — the perfect way to test how ScioSprints makes revision fun and effective for your child.</p>
              </div>
            </div>

            {/* Refund box */}
            <div className="flex items-center gap-4 p-4 bg-green-50 border border-green-100 rounded-xl shadow-sm">
              <div className="flex-shrink-0">
                {/* Shield-check SVG icon */}
                <div className="w-12 h-12 rounded-md bg-green-100 text-green-700 flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M12 2L3 6v5c0 5 3.8 9.7 9 11 5.2-1.3 9-6 9-11V6l-9-4z" stroke="#16a34a" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
                    <path d="M9 12l2 2 4-4" stroke="#16a34a" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              </div>
              <div className="text-left">
                <h3 className="text-lg font-semibold">7-Day No-Questions-Asked Refund</h3>
                <p className="mt-1 text-sm text-gray-700">Try ScioSprints risk-free. If it’s not the right fit for your child, get a full refund within 7 days — no questions asked!</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function formatINR(value: number | string) {
  // If value is a string already formatted, return as-is
  if (typeof value === 'string') return value;
  // If value looks like paise (e.g., 29900), divide by 100
  const amount = value > 1000 ? value / 100 : value;
  // Format to INR currency
  try {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(amount);
  } catch {
    return `₹${(amount).toFixed(0)}`;
  }
}
