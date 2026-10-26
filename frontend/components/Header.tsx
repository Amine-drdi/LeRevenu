'use client';

import Link from 'next/link';

import { useAuth } from '@/context/AuthContext';

/**
 * En-tête du forum — Client Component car il dépend de l'état d'auth.
 */
export default function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-10 border-b border-zinc-800 bg-zinc-950/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-serif text-2xl font-bold text-white">Le Revenu</span>
          <span className="hidden rounded-full border border-brand/40 px-2 py-0.5 text-xs font-semibold uppercase tracking-wider text-brand sm:inline">
            Forum
          </span>
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="hidden text-zinc-300 transition hover:text-white sm:inline">
            Discussions
          </Link>
          <Link
            href="/discussions/nouvelle"
            className="rounded bg-brand px-3 py-1.5 font-semibold text-white transition hover:bg-brand-dark"
          >
            + Nouvelle discussion
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden text-zinc-400 md:inline">{user.username}</span>
              <button
                type="button"
                onClick={logout}
                className="text-zinc-400 transition hover:text-white"
              >
                Déconnexion
              </button>
            </div>
          ) : (
            <Link href="/connexion" className="text-zinc-300 transition hover:text-white">
              Connexion
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
