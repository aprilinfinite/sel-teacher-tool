// src/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Providers from '@/components/shared/Providers';

export const metadata: Metadata = {
  title: {
    default: 'SEL Teacher Tools',
    template: '%s | SEL Teacher Tools',
  },
  description: 'Real support for real classroom moments.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
