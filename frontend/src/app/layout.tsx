import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KeyPulse — Developer API Key & Gateway Analytics',
  description: 'Enterprise developer portal for API key provisioning, rate limiting, and real-time usage metrics.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-zinc-950 text-zinc-100 antialiased selection:bg-emerald-500/20 selection:text-emerald-300`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
