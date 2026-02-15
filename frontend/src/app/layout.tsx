import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { AppProvider } from '@/contexts/AppContext';
import { ErrorProvider } from '@/components/error';
import { Header, Footer } from '@/components/layout';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'Finance Tracker',
  description: 'Трекер личных финансов',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <ErrorProvider>
          <AppProvider>
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </AppProvider>
        </ErrorProvider>
      </body>
    </html>
  );
}
