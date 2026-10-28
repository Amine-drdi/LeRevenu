'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

const SEG = 'grid h-8 place-items-center rounded-lg text-[13.5px] font-medium text-ink-2 transition hover:text-ink';
const SEG_ON = 'bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.14)]';
const INPUT =
  'mt-1.5 h-[38px] w-full rounded-ctl border border-line bg-surface px-3 text-sm transition focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25';

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
        <div className="mx-auto flex max-w-[430px] flex-col gap-4 py-12 pb-24">
          <div className="text-center">
            <h1 className="font-display text-[28px] font-bold tracking-[-0.015em]">
              {mode === 'connexion' ? 'Connexion' : 'Inscription'}
            </h1>
            <p className="mt-0.5 text-sm text-ink-3">
              {mode === 'connexion'
                ? 'Accédez à votre compte pour participer aux discussions.'
                : 'Créez un compte pour poser vos questions et répondre.'}
            </p>
          </div>

          <div className="flex flex-col gap-4 rounded-card border border-hairline bg-surface p-6 shadow-lift">
            <div className="grid auto-cols-fr grid-flow-col gap-[3px] rounded-[10px] bg-fill p-[3px]" role="tablist" aria-label="Mode">
              {(['connexion', 'inscription'] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  role="tab"
                  aria-selected={mode === m}
                  onClick={() => switchMode(m)}
                  className={`${SEG} ${mode === m ? SEG_ON : ''}`}
                >
                  {m === 'connexion' ? 'Connexion' : 'Inscription'}
                </button>
              ))}
            </div>

            <form onSubmit={onSubmit} className="flex flex-col gap-4">
              {mode === 'connexion' ? (
                <label className="block text-[13px] font-medium text-ink-2">
                  Pseudo ou e-mail
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    required
                    autoComplete="username"
                    className={INPUT}
                  />
                </label>
              ) : (
                <>
                  <label className="block text-[13px] font-medium text-ink-2">
                    Pseudo
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      autoComplete="username"
                      className={INPUT}
                    />
                  </label>
                  <label className="block text-[13px] font-medium text-ink-2">
                    E-mail
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className={INPUT}
                    />
                  </label>
                </>
              )}

              <label className="block text-[13px] font-medium text-ink-2">
                Mot de passe
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
                  className={INPUT}
                />
              </label>

              {mode === 'inscription' && (
                <label className="block text-[13px] font-medium text-ink-2">
                  Confirmer le mot de passe
                  <input
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    autoComplete="new-password"
                    className={INPUT}
                  />
                </label>
              )}

              {error && (
                <p className="flex items-start gap-2 rounded-ctl border border-[color-mix(in_srgb,var(--alert)_30%,transparent)] bg-[var(--alert-soft)] px-3 py-2.5 text-[13.5px] text-[var(--alert)]">
                  {error}
                </p>
              )}

              <button type="submit" disabled={pending} className="inline-flex h-9 w-full items-center justify-center gap-[7px] whitespace-nowrap rounded-ctl border border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand px-4 text-sm font-semibold text-white shadow-btn transition hover:brightness-95 active:scale-[0.98] disabled:opacity-50">
                {pending
                  ? 'En cours…'
                  : mode === 'connexion'
                    ? 'Se connecter'
                    : 'Créer mon compte'}
              </button>
            </form>
          </div>

          <p className="text-center text-[13.5px] text-ink-3">
            <Link href="/" className="inline-flex items-center gap-1.5 font-medium hover:text-brand-text">
              ← Retour aux discussions
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
