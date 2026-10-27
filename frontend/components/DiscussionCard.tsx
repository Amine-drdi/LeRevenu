import Link from 'next/link';

import Avatar from '@/components/Avatar';
import { IconMessages } from '@/components/icons';
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
  const authorName = discussion.author?.username ?? 'anonyme';

  return (
    <article className="disc">
      <div className="disc-top">
        <span className={`chip ${discussion.type === 'question' ? 'chip-q' : 'chip-d'}`}>
          {discussion.type === 'question' ? 'Question' : 'Discussion'}
        </span>
        {discussion.category && (
          <span className="chip chip-cat">{discussion.category.name}</span>
        )}
        <span className="sep" aria-hidden="true">
          ·
        </span>
        <time dateTime={discussion.createdAt}>{dateFmt.format(new Date(discussion.createdAt))}</time>
      </div>

      <h2 className="disc-t">
        <Link href={`/discussions/${discussion.slug}`}>{discussion.title}</Link>
      </h2>

      <p className="disc-x">{discussion.content}</p>

      <div className="disc-f">
        <Avatar username={authorName} size="sm" />
        <span className="who">{authorName}</span>
        <span className="grow">
          <IconMessages className="icon" />
          {replyCount} réponse{replyCount > 1 ? 's' : ''}
        </span>
      </div>
    </article>
  );
}
