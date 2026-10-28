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
    <main className="wrap">
      <div className="mx-auto flex max-w-[430px] flex-col items-center gap-4 py-12 pb-24 text-center">
        <p className="font-display text-[44px] font-bold">Oups</p>
        <h1 className="font-display text-[21px] font-bold">L&apos;API est injoignable</h1>
        <p className="text-sm text-ink-3">
          Vérifiez que le backend Strapi tourne (port 1337) puis réessayez.
        </p>
        <div>
          <button type="button" onClick={reset} className="inline-flex h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-ctl border border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand px-4 text-sm font-semibold text-white shadow-btn transition hover:brightness-95 active:scale-[0.98]">
            Réessayer
          </button>
        </div>
      </div>
    </main>
  );
}
