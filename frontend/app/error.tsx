'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Erreur rendu :', error);
  }, [error]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-24 text-center">
      <p className="font-serif text-6xl text-brand">Erreur</p>
      <h1 className="mt-4 font-serif text-2xl text-white">L&apos;API est injoignable</h1>
      <p className="mt-2 text-zinc-400">
        Vérifiez que le backend Strapi tourne (port 1337) puis réessayez.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
      >
        Réessayer
      </button>
    </main>
  );
}
