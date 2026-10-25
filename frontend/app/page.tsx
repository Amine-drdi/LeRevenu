/**
 * Placeholder de démarrage (Étape 1).
 * La liste des discussions (Server Component alimentée par l'API Strapi)
 * arrive à l'Étape 5.
 */
export default function Home() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-12">
      <p className="text-sm font-semibold uppercase tracking-widest text-brand">
        Forum communautaire
      </p>
      <h1 className="mt-2 font-serif text-4xl">Le Revenu — Forum</h1>
      <p className="mt-4 text-zinc-400">
        Scaffold initial opérationnel. La liste des discussions (depuis Strapi) arrive à
        l&apos;étape 5.
      </p>
    </main>
  );
}
