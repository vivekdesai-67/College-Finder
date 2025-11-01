import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CollegeFinder - CET Based Engineering College Finder',
  description: 'Find the perfect engineering college based on your CET rank and preferences',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
          {children}
        </main>
        <Toaster />
      </body>
    </html>
  );
}