import type { Metadata } from 'next';
import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import { IconArrowLeft } from '@/components/icons';
import LikeButton from '@/components/LikeButton';
import PollSection from '@/components/PollSection';
import ReplySection from '@/components/ReplySection';
import SideNav from '@/components/SideNav';
import { ApiRequestError, getCategories, getDiscussionBySlug } from '@/lib/api';

/**
 * Détail d'une discussion (Server Component) — URL propre /discussions/[slug].
 * La discussion vient de l'API Strapi (ISR) ; la section réponses
 * (liste + formulaire) est un Client Component : components/ReplySection.tsx.
 */
const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const CHIP: Record<string, string> = {
  question: 'bg-brand-soft text-brand-text',
  poll: 'bg-pro/10 text-pro',
  discussion: 'bg-fill text-ink-2',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const discussion = await getDiscussionBySlug(slug);
    return { title: `${discussion.title} — Le Revenu` };
  } catch (error) {
    // API injoignable : titre générique, error.tsx prend le relais au rendu.
    // notFound() ne doit JAMAIS être avalé ici — sinon le statut 404 devient 200.
    if (error instanceof ApiRequestError) {
      return { title: 'Le Revenu — Communauté' };
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
  // La barre latérale affiche les espaces, comme sur l'accueil.
  const [discussion, categories] = await Promise.all([
    getDiscussionBySlug(slug),
    getCategories(),
  ]);
  const authorName = discussion.author?.username ?? 'anonyme';
  const typeLabel =
    discussion.type === 'question' ? 'Question' : discussion.type === 'poll' ? 'Sondage' : 'Discussion';

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)]">
          <SideNav categories={categories} active={discussion.category?.slug} />

          <main className="flex min-w-0 flex-col gap-[18px]">
            <Link href="/" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-medium text-ink-3 hover:text-brand-text">
              <IconArrowLeft className="icon" />
              Toutes les discussions
            </Link>

            <article className="rounded-card border border-hairline bg-surface p-6 shadow-card">
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
                <time dateTime={discussion.createdAt}>
                  {dateTimeFmt.format(new Date(discussion.createdAt))}
                </time>
              </div>

              <h1 className="mt-3 font-display text-[27px] font-bold leading-[1.25] tracking-[-0.015em]">
                {discussion.title}
              </h1>

              <p className="mt-3.5 flex items-center gap-2.5 text-[13px] text-ink-3">
                <Avatar username={authorName} size="sm" />
                <span>
                  par <span className="font-semibold text-ink-2">{authorName}</span>
                </span>
              </p>

              <div className="mt-4 whitespace-pre-line border-t border-hairline pt-4 text-[15px] leading-[1.65]">
                {discussion.content}
              </div>

              {discussion.type === 'poll' && discussion.poll && (
                <PollSection
                  discussionDocumentId={discussion.documentId}
                  initialPoll={discussion.poll}
                />
              )}

              <div className="mt-4 flex items-center gap-2.5">
                <LikeButton
                  targetType="discussion"
                  targetId={discussion.documentId}
                  initialLikes={discussion.likes ?? 0}
                  initialLiked={discussion.likedByMe ?? false}
                />
                <span className="text-[12.5px] tabular-nums text-ink-3">
                  {discussion.views ?? 0} vue{(discussion.views ?? 0) > 1 ? 's' : ''}
                </span>
              </div>
            </article>

            <ReplySection
              discussionDocumentId={discussion.documentId}
              initialReplies={discussion.replies ?? []}
              solutionDocumentId={discussion.solution?.documentId}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
