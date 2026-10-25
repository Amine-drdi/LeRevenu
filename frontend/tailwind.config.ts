import type { Config } from 'tailwindcss';

/**
 * Design system issu de la maquette Le Revenu :
 * - Typographies : Playfair Display (titres, serif) + Inter (texte courant, sans)
 * - Couleur de marque : rouge #EB0F0F
 * - Thème sombre par défaut, variante claire basculable (class "dark" sur <html>)
 */
const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#EB0F0F',
          dark: '#C40D0D',
          light: '#FF3B3B',
        },
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
