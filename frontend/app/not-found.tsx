import Link from 'next/link';

import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div>
      <Header />
      <main className="wrap">
        <div className="auth-page" style={{ textAlign: 'center' }}>
          <p className="page-title" style={{ fontSize: 44 }}>
            404
          </p>
          <h1 className="sec-title" style={{ justifyContent: 'center' }}>
            Discussion introuvable
          </h1>
          <p className="page-sub">Cette discussion n&apos;existe pas ou a été déplacée.</p>
          <div>
            <Link href="/" className="btn btn-primary">
              Retour aux discussions
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
