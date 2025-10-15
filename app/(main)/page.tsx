import { redirect } from 'next/navigation';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'ScioSprints – CBSE Class 4–8 Gamified Revision (Play & Learn)',
  description: 'Make CBSE revision fun for Classes 4–8 with curriculum aligned games, leaderboards, and progress tracking. Try free demos learn faster, score better.'
};

export default function Home() {
  redirect('/dashboard');
}