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
      <div className="auth-page" style={{ textAlign: 'center' }}>
        <p className="page-title" style={{ fontSize: 44 }}>
          Oups
        </p>
        <h1 className="sec-title" style={{ justifyContent: 'center' }}>
          L&apos;API est injoignable
        </h1>
        <p className="page-sub">
          Vérifiez que le backend Strapi tourne (port 1337) puis réessayez.
        </p>
        <div>
          <button type="button" onClick={reset} className="btn btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    </main>
  );
}
