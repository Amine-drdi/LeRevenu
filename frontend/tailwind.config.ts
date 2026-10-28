import type { Config } from 'tailwindcss';

/**
 * Design system Le Revenu exprimé en tokens Tailwind.
 * Les couleurs référencent les variables CSS de globals.css (`--ink`,
 * `--surface`…) : le thème clair/sombre bascule par `prefers-color-scheme`
 * sans variante `dark:` — les variables flippent, les utilitaires suivent.
 */
const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './context/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: '#eb0f0f',
        'brand-hover': '#d00d0d',
        'brand-soft': 'var(--brand-soft)',
        'brand-text': 'var(--brand-text)',
        ink: { DEFAULT: 'var(--ink)', 2: 'var(--ink-2)', 3: 'var(--ink-3)' },
        surface: { DEFAULT: 'var(--surface)', 2: 'var(--surface-2)', 3: 'var(--surface-3)' },
        canvas: 'var(--bg)',
        glass: 'var(--glass)',
        hairline: 'var(--hairline)',
        line: { DEFAULT: 'var(--line)', strong: 'var(--line-strong)' },
        fill: { DEFAULT: 'var(--fill)', 2: 'var(--fill-2)' },
        ok: { DEFAULT: 'var(--ok)', soft: 'var(--ok-soft)' },
        redac: { DEFAULT: 'var(--redac)', soft: 'var(--redac-soft)' },
        pro: '#0a66d8',
      },
      fontFamily: {
        sans: ['var(--font-inter)', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      borderRadius: {
        card: '14px',
        ctl: '9px',
      },
      boxShadow: {
        card: 'var(--shadow)',
        lift: 'var(--shadow-lg)',
        btn: 'inset 0 1px 0 rgba(255,255,255,0.22), 0 1px 2px rgba(235,15,15,0.35)',
        soft: '0 1px 2px rgba(0,0,0,0.06)',
      },
      maxWidth: {
        wrap: '1260px',
      },
    },
  },
  plugins: [],
};

export default config;
