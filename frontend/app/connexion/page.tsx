'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

/**
 * Page de connexion / inscription (Client Component).
 *
 * Le JWT est stocké en localStorage par l'AuthContext et transmis aux
 * mutations par `authedFetch` (header Authorization) — jamais dans une
 * variable NEXT_PUBLIC_ ni dans les URLs (voir lib/api.ts). Après succès,
 * retour à l'accueil : le Header (client) reflète immédiatement la session.
 */
type Mode = 'connexion' | 'inscription';

export default function ConnexionPage() {
  const router = useRouter();
  const { login, register } = useAuth();

  const [mode, setMode] = useState<Mode>('connexion');
  const [identifier, setIdentifier] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (mode === 'inscription') {
      if (password !== confirm) {
        setError('Les mots de passe ne correspondent pas.');
        return;
      }
      if (password.length < 6) {
        setError('Le mot de passe doit contenir au moins 6 caractères.');
        return;
      }
    }

    setPending(true);
    try {
      if (mode === 'connexion') {
        await login(identifier.trim(), password);
      } else {
        await register(username.trim(), email.trim(), password);
      }
      router.push('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setPending(false);
    }
  };

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="auth-page">
          <div style={{ textAlign: 'center' }}>
            <h1 className="page-title">
              {mode === 'connexion' ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="page-sub">
              {mode === 'connexion'
                ? 'Accédez à votre compte pour participer aux discussions.'
                : 'Créez un compte pour poser vos questions et répondre.'}
            </p>
          </div>

          <div className="auth-card">
            <div className="seg" role="tablist" aria-label="Mode">
              {(['connexion', 'inscription'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={mode === m ? 'on' : ''}
                >
                  {m === 'connexion' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="form">
              {mode === 'connexion' ? (
                <label className="fld">
                  Pseudo ou e-mail
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                    className="input"
                  />
                </label>
              ) : (
                <>
                  <label className="fld">
                    Pseudo
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                      className="input"
                    />
                  </label>
                  <label className="fld">
                    E-mail
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="input"
                    />
                  </label>
                </>
              )}

              <label className="fld">
                Mot de passe
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
                  className="input"
                />
              </label>

              {mode === 'inscription' && (
                <label className="fld">
                  Confirmer le mot de passe
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="input"
                  />
                </label>
              )}

              {error && <p className="alert">{error}</p>}

              <button type="submit" disabled={pending} className="btn btn-primary btn-block">
                {pending
                  ? 'En cours…'
                  : mode === 'connexion'
                    ? 'Se connecter'
                    : 'Créer mon compte'}
              </button>
            </form>
          </div>

          <p className="auth-foot">
            <Link href="/" className="back">
              ← Retour aux discussions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
