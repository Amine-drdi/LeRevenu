'use client';

import Link from 'next/link';

import Avatar from '@/components/Avatar';
import { IconLogOut, IconPlus } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';

/**
 * Barre de liaison lerevenu.com + en-tête collé de la communauté.
 * Client Component : la zone « compte » dépend de l'état d'auth (contexte).
 */
export default function Header() {
  const { user, logout } = useAuth();

  return (
    <>
      {/* Barre de liaison vers les sites du groupe */}
      <div className="border-b border-hairline bg-surface text-[13px] text-ink-2">
        <div className="wrap flex h-[38px] items-center gap-5">
          <a href="https://www.lerevenu.com" className="font-semibold text-ink">
            lerevenu.com
          </a>
          <nav className="flex min-w-0 gap-4 overflow-hidden border-l border-line pl-5 max-[720px]:hidden" aria-label="Sites Le Revenu">
            <a className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-brand-text" href="https://www.lerevenu.com/bourse">Bourse</a>
            <a className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-brand-text" href="https://www.lerevenu.com/immobilier">Immobilier</a>
            <a className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-brand-text" href="https://www.lerevenu.com/fiscalite">Fiscalité</a>
            <a className="inline-flex items-center gap-1.5 whitespace-nowrap hover:text-brand-text" href="https://www.lerevenu.com/patrimoine">Patrimoine</a>
          </nav>
          <div className="ml-auto">
            <a
              href="https://www.lerevenu.com"
              className="rounded-full bg-brand px-[11px] py-[3px] font-semibold text-white hover:brightness-95"
            >
              S’abonner
            </a>
          </div>
        </div>
      </div>

      {/* En-tête principal */}
      <header className="sticky top-0 z-40 border-b border-hairline bg-glass [backdrop-filter:saturate(180%)_blur(20px)]">
        <div className="wrap flex h-[62px] items-center gap-5">
          <Link href="/" className="flex flex-none cursor-pointer items-center gap-2.5" aria-label="Le Revenu — Communauté, accueil">
            <span className="inline-flex bg-brand p-[0.1em] text-[22px] leading-none" aria-hidden="true">
              <span className="mr-[0.12em] bg-black px-[0.1em] py-[0.12em] font-black text-white">LE</span>
              <span className="px-[0.1em] py-[0.12em] font-black tracking-[-0.02em] text-white">REVENU</span>
            </span>
            <span className="h-5 w-px bg-line-strong max-[720px]:hidden" aria-hidden="true" />
            <span className="text-[15px] font-semibold text-ink-2 max-[720px]:hidden">Communauté</span>
          </Link>

          <div className="relative ml-auto flex items-center gap-2.5">
            <Link href="/discussions/nouvelle" className="inline-flex h-[30px] items-center justify-center gap-[7px] whitespace-nowrap rounded-lg border border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand px-3 text-[13px] font-semibold text-white shadow-btn transition hover:brightness-95 active:scale-[0.98]">
              <IconPlus className="icon" />
              Nouvelle discussion
            </Link>
            {user ? (
              <span className="flex items-center gap-2 rounded-full border border-hairline bg-surface py-[3px] pl-[3px] pr-2.5 shadow-soft hover:bg-surface-2">
                <Avatar username={user.username} size="sm" />
                <span className="max-[720px]:hidden">{user.username}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="grid h-7 w-7 place-items-center rounded-full text-ink-2 hover:bg-fill hover:text-ink"
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                >
                  <IconLogOut className="icon" />
                </button>
              </span>
            ) : (
              <Link href="/connexion" className="inline-flex h-[30px] items-center justify-center gap-[7px] whitespace-nowrap rounded-lg border border-hairline bg-surface px-3 text-[13px] font-semibold text-ink shadow-soft transition hover:bg-surface-2 active:scale-[0.98]">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
