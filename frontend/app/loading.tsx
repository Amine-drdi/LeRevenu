import Header from '@/components/Header';

/** État de chargement (skeleton) de l'accueil. */
export default function Loading() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="h-10 w-64 animate-pulse rounded bg-zinc-800" />
        <div className="mt-2 h-5 w-40 animate-pulse rounded bg-zinc-800" />
        <div className="mt-8 flex gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-zinc-800" />
          ))}
        </div>
        <div className="mt-6 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-36 animate-pulse rounded-lg bg-zinc-900" />
          ))}
        </div>
      </main>
    </div>
  );
}
