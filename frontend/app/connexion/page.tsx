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

  const field =
    'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-brand focus:outline-none';

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-3xl text-white">
          {mode === 'connexion' ? 'Connexion' : 'Inscription'}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          {mode === 'connexion'
            ? 'Accédez à votre compte pour participer aux discussions.'
            : 'Créez un compte pour poser vos questions et répondre.'}
        </p>

        <div className="mt-6 flex rounded-lg border border-zinc-800 p-1">
          {(['connexion', 'inscription'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => switchMode(m)}
              className={
                mode === m
                  ? 'flex-1 rounded-md bg-brand py-1.5 text-sm font-semibold text-white'
                  : 'flex-1 rounded-md py-1.5 text-sm text-zinc-400 transition hover:text-white'
              }
            >
              {m === 'connexion' ? 'Connexion' : 'Inscription'}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          {mode === 'connexion' ? (
            <label className="block text-sm text-zinc-300">
              Pseudo ou e-mail
              <input
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
                autoComplete="username"
                className={`mt-1 ${field}`}
              />
            </label>
          ) : (
            <>
              <label className="block text-sm text-zinc-300">
                Pseudo
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  className={`mt-1 ${field}`}
                />
              </label>
              <label className="block text-sm text-zinc-300">
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  className={`mt-1 ${field}`}
                />
              </label>
            </>
          )}

          <label className="block text-sm text-zinc-300">
            Mot de passe
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
              className={`mt-1 ${field}`}
            />
          </label>

          {mode === 'inscription' && (
            <label className="block text-sm text-zinc-300">
              Confirmer le mot de passe
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className={`mt-1 ${field}`}
              />
            </label>
          )}

          {error && (
            <p className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand-light">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending
              ? 'En cours…'
              : mode === 'connexion'
                ? 'Se connecter'
                : 'Créer mon compte'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-500">
          <Link href="/" className="text-brand-light hover:underline">
            ← Retour aux discussions
          </Link>
        </p>
      </main>
    </div>
  );
}
