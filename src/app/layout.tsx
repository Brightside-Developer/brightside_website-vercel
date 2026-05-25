import type { Metadata } from 'next';
import { Playfair_Display, DM_Sans, DM_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import DarkModeScript from '@/components/DarkModeScript';
import Navbar from '@/components/Navbar';
import ConditionalFooter from '@/components/ConditionalFooter';

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '700', '900'],
  style: ['normal', 'italic'],
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600', '700'],
});

const dmMono = DM_Mono({
  subsets: ['latin'],
  variable: '--font-dm-mono',
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  title: 'Brightside — Financial Literacy for Everyone',
  description: 'Brightside is a nonprofit empowering communities through practical financial education — from kids learning to save their first dollar, to seniors planning their legacy.',
  icons: {
    icon: '/logo.png?v=2',
    apple: '/logo.png?v=2',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${dmSans.variable} ${dmMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <DarkModeScript />
      </head>
      <body className="min-h-full flex flex-col bg-warm-white dark:bg-[#1a1f1a] text-charcoal dark:text-[#e8f0e0] transition-colors duration-200">
        <AuthProvider>
          <Navbar />
          <main className="flex-grow flex flex-col">{children}</main>
          <ConditionalFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
