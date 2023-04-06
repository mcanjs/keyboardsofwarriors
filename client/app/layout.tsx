import StyledComponentsRegistry from './registry';

export const metadata = {
  title: 'Keyboards Warriors',
  description: 'Compete according to your keyboard speed in multiplayer, make yourself happy by winning prizes.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StyledComponentsRegistry>{children}</StyledComponentsRegistry>
      </body>
    </html>
  );
}
