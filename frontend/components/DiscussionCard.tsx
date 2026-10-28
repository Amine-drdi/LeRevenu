import Link from 'next/link';

import Avatar from '@/components/Avatar';
import { IconMessages } from '@/components/icons';
import type { Discussion } from '@/types';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});

const CHIP: Record<string, string> = {
  question: 'bg-brand-soft text-brand-text',
  poll: 'bg-pro/10 text-pro',
  discussion: 'bg-fill text-ink-2',
};

/**
 * Carte d'une discussion dans la liste (Server Component — aucun état).
 */
export default function DiscussionCard({ discussion }: { discussion: Discussion }) {
  const replyCount = discussion.replyCount ?? discussion.replies?.length ?? 0;
  const authorName = discussion.author?.username ?? 'anonyme';
  const typeLabel =
    discussion.type === 'question' ? 'Question' : discussion.type === 'poll' ? 'Sondage' : 'Discussion';

  return (
    <article className="block rounded-card border border-hairline bg-surface px-[18px] py-4 shadow-card transition hover:-translate-y-px hover:border-line-strong hover:shadow-lift">
      <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
        <span className={`inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full px-[9px] text-[11.5px] font-semibold tracking-[0.02em] ${CHIP[discussion.type]}`}>
          {typeLabel}
        </span>
        {discussion.category && (
          <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full border border-hairline px-[9px] text-[11.5px] font-medium text-ink-3">
            {discussion.category.name}
          </span>
        )}
        <span className="text-line-strong" aria-hidden="true">·</span>
        <time dateTime={discussion.createdAt}>{dateFmt.format(new Date(discussion.createdAt))}</time>
      </div>

      <h2 className="mt-2 font-display text-[18px] font-bold leading-[1.3] tracking-[-0.01em]">
        <Link href={`/discussions/${discussion.slug}`} className="hover:text-brand-text">
          {discussion.title}
        </Link>
      </h2>

      <p className="mt-1 line-clamp-2 whitespace-pre-line text-[13.5px] leading-normal text-ink-3">
        {discussion.content}
      </p>

      <div className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-3">
        <Avatar username={authorName} size="sm" />
        <span className="font-semibold text-ink-2">{authorName}</span>
        <span className="ml-auto inline-flex items-center gap-1.5">
          <IconMessages className="h-[15px] w-[15px]" />
          {replyCount} réponse{replyCount > 1 ? 's' : ''}
        </span>
      </div>
    </article>
  );
}
