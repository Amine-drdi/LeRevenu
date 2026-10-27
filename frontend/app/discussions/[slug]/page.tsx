import type { Metadata } from 'next';
import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import { IconArrowLeft } from '@/components/icons';
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
                <span className={`chip ${discussion.type === 'question' ? 'chip-q' : 'chip-d'}`}>
                  {discussion.type === 'question' ? 'Question' : 'Discussion'}
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
            </article>

            <ReplySection
              discussionDocumentId={discussion.documentId}
              initialReplies={discussion.replies ?? []}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
