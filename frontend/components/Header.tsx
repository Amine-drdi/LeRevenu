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
      <div className="sitebar">
        <div className="wrap">
          <a href="https://www.lerevenu.com" className="sb-back">
            lerevenu.com
          </a>
          <nav className="sb-links" aria-label="Sites Le Revenu">
            <a href="https://www.lerevenu.com/bourse">Bourse</a>
            <a href="https://www.lerevenu.com/immobilier">Immobilier</a>
            <a href="https://www.lerevenu.com/fiscalite">Fiscalité</a>
            <a href="https://www.lerevenu.com/patrimoine">Patrimoine</a>
          </nav>
          <div className="sb-right">
            <a
              href="https://www.lerevenu.com"
              className="sb-sub"
            >
              S’abonner
            </a>
          </div>
        </div>
      </div>

      {/* En-tête principal */}
      <header className="hdr">
        <div className="wrap hdr-in">
          <Link href="/" className="brand" aria-label="Le Revenu — Communauté, accueil">
            <span className="lr-logo" aria-hidden="true">
              <span className="lr-le">LE</span>
              <span>REVENU</span>
            </span>
            <span className="brand-sep" aria-hidden="true" />
            <span className="brand-sub">Communauté</span>
          </Link>

          <div className="hdr-act">
            <Link href="/discussions/nouvelle" className="btn btn-primary btn-sm">
              <IconPlus className="icon" />
              Nouvelle discussion
            </Link>
            {user ? (
              <span className="me-btn">
                <Avatar username={user.username} size="sm" />
                <span className="who">{user.username}</span>
                <button
                  type="button"
                  onClick={logout}
                  className="icon-btn"
                  title="Se déconnecter"
                  aria-label="Se déconnecter"
                >
                  <IconLogOut className="icon" />
                </button>
              </span>
            ) : (
              <Link href="/connexion" className="btn btn-secondary btn-sm">
                Connexion
              </Link>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
