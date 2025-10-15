'use client';

export default function ClassLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  // Once authenticated, render the page component which will handle access and data loading
  return <>{children}</>;
}