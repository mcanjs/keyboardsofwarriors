// Style
import '../style/global.css';

import { Inter } from 'next/font/google';
import { Header } from '../components/header';
import ToastifyProvider from '../providers/toaster';
import { ReduxProvider } from '../providers/redux';

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
        <ReduxProvider>
          <Header />
          <div className="w-full my-[20px] z-[1]">
            <div className="w-[728px] h-[90px] flex justiy-center items-center bg-gray-400 mx-auto">
              <h3 className="mx-auto text-white">728x90</h3>
            </div>
          </div>
          <main>{children}</main>
          <ToastifyProvider />
        </ReduxProvider>
      </body>
    </html>
  );
}
