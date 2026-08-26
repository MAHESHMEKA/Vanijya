import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth-context';
import { LanguageProvider } from '../lib/language-context';
import { ToastProvider } from '../components/ui/toast';
import { TopNav } from '../components/ui/top-nav';

export const metadata: Metadata = {
  title: 'Vanijya (वाणिज्य) | National Agricultural Price & Market Linkages Portal',
  description: 'Real-time APMC Mandi Price Intelligence, Spatial Arbitrage, and Direct Farm-Gate Linkages',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-amber-50/30 text-slate-900 font-sans antialiased selection:bg-amber-300 selection:text-amber-950">
        <AuthProvider>
          <LanguageProvider>
            <ToastProvider>
              <TopNav />
              <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
                {children}
              </main>
            </ToastProvider>
          </LanguageProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
