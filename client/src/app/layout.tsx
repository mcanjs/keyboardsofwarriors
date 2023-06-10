// Style
import '../style/global.css';

import { Inter } from 'next/font/google';
import ToastifyProvider from '../providers/toaster';
import { ReduxProvider } from '../providers/redux';
import Header from '../components/header';
import Footer from '../components/footer';

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
    <html data-theme="dark" lang="en" className={inter.className}>
      <body className="min-h-screen flex flex-col">
        <ReduxProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </ReduxProvider>
        <ToastifyProvider />
      </body>
    </html>
  );
}
