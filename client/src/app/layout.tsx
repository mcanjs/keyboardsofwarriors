import { Inter } from 'next/font/google';
import '../style/global.css';
import { Header } from '../components/header';
import ToastifyProvider from './toastify';

export const metadata = {
  title: 'Keyboards of Warriors',
  description: 'Compete according to your keyboard speed in multiplayer, make yourself happy by winning prizes.',
};

const inter = Inter({
  weight: ['100', '300', '400', '700', '900'],
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <Header />
        <main>{children}</main>
        <ToastifyProvider />
      </body>
    </html>
  );
}
