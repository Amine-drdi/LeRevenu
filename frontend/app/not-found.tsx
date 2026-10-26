import Header from '@/components/Header';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-24 text-center">
        <p className="font-serif text-6xl text-brand">404</p>
        <h1 className="mt-4 font-serif text-2xl text-white">Discussion introuvable</h1>
        <p className="mt-2 text-zinc-400">
          Cette discussion n&apos;existe pas ou a été déplacée.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          Retour aux discussions
        </Link>
      </main>
    </div>
  );
}
