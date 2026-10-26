import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Le Revenu — Forum',
  description: "Espace communautaire des lecteurs du Revenu : discussions, questions et réponses entre passionnés de finance.",
};

/**
 * Shell minimal de démarrage (Étape 1) — sera étendu aux étapes 4-6
 * (Header, AuthProvider, thème sombre/clair, etc.).
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`dark ${inter.variable} ${playfair.variable}`}>
      <body className="min-h-screen bg-zinc-950 font-sans text-zinc-100 antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
