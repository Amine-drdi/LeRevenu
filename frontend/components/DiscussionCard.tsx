import Link from 'next/link';

import type { Discussion } from '@/types';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

/**
 * Carte d'une discussion dans la liste (Server Component — aucun état).
 */
export default function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const replyCount = discussion.replyCount ?? discussion.replies?.length ?? 0;

  return (
    <article className="rounded-lg border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-600">
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
        <span className="text-zinc-500">{dateFmt.format(new Date(discussion.createdAt))}</span>
      </div>

      <h2 className="mt-3 font-serif text-xl leading-snug">
        <Link
          href={`/discussions/${discussion.slug}`}
          className="text-zinc-50 transition hover:text-brand-light"
        >
          {discussion.title}
        </Link>
      </h2>

      <p className="mt-2 line-clamp-2 whitespace-pre-line text-sm text-zinc-400">
        {discussion.content}
      </p>

      <div className="mt-4 flex items-center justify-between text-xs text-zinc-500">
        <span>
          par <span className="font-medium text-zinc-300">{discussion.author?.username ?? 'anonyme'}</span>
        </span>
        <span>
          {replyCount} réponse{replyCount > 1 ? 's' : ''}
        </span>
      </div>
    </article>
  );
}
