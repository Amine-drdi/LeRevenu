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

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="layout no-right">
          <SideNav categories={categories} active={discussion.category?.slug} />

          <main className="main">
            <Link href="/" className="back">
              <IconArrowLeft className="icon" />
              Toutes les discussions
            </Link>

            <article className="article">
              <div className="disc-top">
                <span
                  className={`chip ${
                    discussion.type === 'question'
                      ? 'chip-q'
                      : discussion.type === 'poll'
                        ? 'chip-p'
                        : 'chip-d'
                  }`}
                >
                  {discussion.type === 'question'
                    ? 'Question'
                    : discussion.type === 'poll'
                      ? 'Sondage'
                      : 'Discussion'}
                </span>
                {discussion.category && (
                  <span className="chip chip-cat">{discussion.category.name}</span>
                )}
                <span className="sep" aria-hidden="true">
                  ·
                </span>
                <time dateTime={discussion.createdAt}>
                  {dateTimeFmt.format(new Date(discussion.createdAt))}
                </time>
              </div>

              <h1 className="article-t">{discussion.title}</h1>

              <p className="article-m">
                <Avatar username={authorName} size="sm" />
                <span>
                  par <span className="who">{authorName}</span>
                </span>
              </p>

              <div className="article-b">{discussion.content}</div>

              {discussion.type === 'poll' && discussion.poll && (
                <PollSection
                  discussionDocumentId={discussion.documentId}
                  initialPoll={discussion.poll}
                />
              )}

              <div className="like-row">
                <LikeButton
                  targetType="discussion"
                  targetId={discussion.documentId}
                  initialLikes={discussion.likes ?? 0}
                  initialLiked={discussion.likedByMe ?? false}
                />
                <span className="muted num" style={{ fontSize: 12.5 }}>
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
