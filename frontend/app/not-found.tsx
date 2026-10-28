import Link from 'next/link';

import Header from '@/components/Header';

export default function NotFound() {
  return (
    <div>
      <Header />
      <main className="wrap">
        <div className="mx-auto flex max-w-[430px] flex-col items-center gap-4 py-12 pb-24 text-center">
          <p className="font-display text-[44px] font-bold">404</p>
          <h1 className="font-display text-[21px] font-bold">Discussion introuvable</h1>
          <p className="text-sm text-ink-3">Cette discussion n&apos;existe pas ou a été déplacée.</p>
          <div>
            <Link href="/" className="inline-flex h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-ctl border border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand px-4 text-sm font-semibold text-white shadow-btn transition hover:brightness-95 active:scale-[0.98]">
              Retour aux discussions
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
