import Navbar from '@/components/navbar';
import StyledComponentsRegistry from './registry';
import { Inter } from 'next/font/google';
import { GlobalStyle } from '@/style';
import { AuthProvider } from './providers';
import { PageCapsule } from './match/styles';

export const metadata = {
  title: 'Keyboards Warriors',
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
        <AuthProvider>
          <StyledComponentsRegistry>
            <div>
              <Navbar />
              <div>{children}</div>
              <GlobalStyle />
            </div>
          </StyledComponentsRegistry>
        </AuthProvider>
      </body>
    </html>
  );
}
