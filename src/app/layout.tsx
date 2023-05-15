import './globals.css';
import { Nunito } from 'next/font/google';

const nunito = Nunito({ subsets: ['latin'] });

export const metadata = {
  title: 'ChatPendium',
  description: 'CorePendium + ChatGPT',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`flex justify-center bg-gray-950 ${nunito.className}`}>
        {children}
      </body>
    </html>
  );
}
