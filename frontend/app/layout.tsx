import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' });

export const metadata: Metadata = {
  title: 'Le Revenu — Communauté',
  description:
    "Espace communautaire des lecteurs du Revenu : discussions, questions et réponses entre passionnés de finance.",
};

/**
 * Racine de l'application — design system Le Revenu (voir globals.css).
 * Le thème clair/sombre suit le réglage système (prefers-color-scheme) ;
 * les variables de police (--font-inter / --font-playfair) consomment les
 * deux polices auto-hébergées par next/font.
 */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable} ${playfair.variable}`}>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
