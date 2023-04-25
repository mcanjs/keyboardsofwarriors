'use client';

import Link from 'next/link';
import { Button } from '@/components/button';

export default function Home() {
  return (
    <main>
      <Link href="/matchmaking">Matchmaking</Link>
    </main>
  );
}
