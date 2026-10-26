import type { Metadata } from 'next';
import Link from 'next/link';

import Header from '@/components/Header';
import { getDiscussionBySlug } from '@/lib/api';

/**
 * Détail d'une discussion (Server Component) — URL propre /discussions/[slug].
 * La discussion et ses réponses (avec auteurs) viennent de l'API Strapi ;
 * le formulaire de réponse est un Client Component (étape 6).
 */
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const discussion = await getDiscussionBySlug(slug);
    return { title: `${discussion.title} — Le Revenu Forum` };
  } catch {
    return { title: 'Le Revenu — Forum' };
  }
}

export default async function DiscussionDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const discussion = await getDiscussionBySlug(slug);
  const replies = discussion.replies ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <Link href="/" className="text-sm text-zinc-500 transition hover:text-brand-light">
          ← Toutes les discussions
        </Link>

        <article className="mt-4">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span
              className={
                discussion.type === 'question'
                  ? 'rounded-full bg-brand/15 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-brand-light'
                  : 'rounded-full bg-zinc-700/60 px-2.5 py-0.5 font-semibold uppercase tracking-wide text-zinc-300'
              }
            >
              {discussion.type === 'question' ? 'Question' : 'Discussion'}
            </span>
            {discussion.category && (
              <span className="rounded-full border border-zinc-700 px-2.5 py-0.5 text-zinc-400">
                {discussion.category.name}
              </span>
            )}
            <span className="text-zinc-500">
              {dateTimeFmt.format(new Date(discussion.createdAt))}
            </span>
          </div>

          <h1 className="mt-3 font-serif text-3xl leading-tight text-white">
            {discussion.title}
          </h1>

          <p className="mt-2 text-sm text-zinc-500">
            par <span className="font-medium text-zinc-300">{discussion.author?.username ?? 'anonyme'}</span>
          </p>

          <div className="mt-6 rounded-lg border border-zinc-800 bg-zinc-900 p-6">
            <p className="whitespace-pre-line text-zinc-200">{discussion.content}</p>
          </div>
        </article>

        <section className="mt-10">
          <h2 className="font-serif text-2xl text-white">
            Réponses <span className="text-zinc-500">({discussion.replyCount ?? replies.length})</span>
          </h2>

          {replies.length === 0 ? (
            <p className="mt-4 rounded-lg border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
              Aucune réponse pour le moment.
            </p>
          ) : (
            <ul className="mt-4 space-y-4">
              {replies.map((reply) => (
                <li key={reply.documentId} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
                  <div className="flex items-center justify-between text-xs text-zinc-500">
                    <span className="font-medium text-zinc-300">
                      {reply.author?.username ?? 'anonyme'}
                    </span>
                    <span>{dateTimeFmt.format(new Date(reply.createdAt))}</span>
                  </div>
                  <p className="mt-3 whitespace-pre-line text-sm text-zinc-200">{reply.content}</p>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-8">
            <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">
              Connectez-vous pour répondre —{' '}
              <Link href="/connexion" className="text-brand-light hover:underline">
                se connecter
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
