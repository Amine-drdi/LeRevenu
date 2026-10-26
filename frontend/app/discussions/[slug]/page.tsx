import type { Metadata } from 'next';
import Link from 'next/link';

import Header from '@/components/Header';
import ReplySection from '@/components/ReplySection';
import { ApiRequestError, getDiscussionBySlug } from '@/lib/api';

/**
 * Détail d'une discussion (Server Component) — URL propre /discussions/[slug].
 * La discussion vient de l'API Strapi (ISR) ; la section réponses
 * (liste + formulaire) est un Client Component : components/ReplySection.tsx.
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
  } catch (error) {
    // API injoignable : titre générique, error.tsx prend le relais au rendu.
    // notFound() ne doit JAMAIS être avalé ici — sinon le statut 404 devient 200.
    if (error instanceof ApiRequestError) {
      return { title: 'Le Revenu — Forum' };
    }
    throw error;
  }
}

export default async function DiscussionDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const discussion = await getDiscussionBySlug(slug);

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

        <ReplySection
          discussionDocumentId={discussion.documentId}
          initialReplies={discussion.replies ?? []}
        />
      </main>
    </div>
  );
}
