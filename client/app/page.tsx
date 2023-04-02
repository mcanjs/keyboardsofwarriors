'use client';
import { Inter, Rubik } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });
const rubik = Rubik({ subsets: ['latin-ext'] });

export default function Home() {
  return (
    <main>
      <input onKeyUp={(e) => console.log(e.key)} />
    </main>
  );
}
