import type { Metadata } from 'next';
import Link from 'next/link';

import Avatar from '@/components/Avatar';
import BlogCommentSection from '@/components/BlogCommentSection';
import Header from '@/components/Header';
import { IconArrowLeft } from '@/components/icons';
import LikeButton from '@/components/LikeButton';
import SideNav from '@/components/SideNav';
import { ApiRequestError, getBlogPostBySlug, getCategories } from '@/lib/api';

/**
 * Détail d'un billet (Server Component) — URL /blog/[slug]. Les commentaires
 * (liste + formulaire) vivent dans BlogCommentSection (Client Component).
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
    const post = await getBlogPostBySlug(slug);
    return { title: `${post.title} — Le Revenu` };
  } catch (error) {
    if (error instanceof ApiRequestError) {
      return { title: 'Blog de la communauté — Le Revenu' };
    }
    throw error;
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [post, categories] = await Promise.all([getBlogPostBySlug(slug), getCategories()]);
  const authorName = post.author?.username ?? 'anonyme';

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="layout no-right">
          <SideNav categories={categories} activeSection="blog" />

          <main className="main">
            <Link href="/blog" className="back">
              <IconArrowLeft className="icon" />
              Tous les billets
            </Link>

            <article className="article">
              <div className="disc-top">
                {post.author?.is_redaction && <span className="chip chip-redac">Rédaction</span>}
                {post.category && <span className="chip chip-cat">{post.category.name}</span>}
                <span className="sep" aria-hidden="true">·</span>
                <time dateTime={post.createdAt}>
                  {dateTimeFmt.format(new Date(post.createdAt))}
                </time>
              </div>

              <h1 className="article-t">{post.title}</h1>

              <p className="article-m">
                <Avatar username={authorName} size="sm" />
                <span>
                  par <span className="who">{authorName}</span>
                </span>
              </p>

              <div className="article-b">{post.body}</div>

              <div className="like-row">
                <LikeButton
                  targetType="blog-post"
                  targetId={post.documentId}
                  initialLikes={post.likes}
                  initialLiked={post.likedByMe}
                />
              </div>
            </article>

            <BlogCommentSection
              blogDocumentId={post.documentId}
              initialComments={post.comments ?? []}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
