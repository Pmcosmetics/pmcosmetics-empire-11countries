import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PM.Cosmetics - منصة بيع مستحضرات التجميل',
  description: 'متجر إلكتروني متكامل لبيع مستحضرات التجميل بالجملة والتجزئة',
};

const queryClient = new QueryClient();

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl">
      <body className={inter.className}>
        <QueryClientProvider client={queryClient}>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </QueryClientProvider>
      </body>
    </html>
  );
}
