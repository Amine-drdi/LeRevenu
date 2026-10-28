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
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)]">
          <SideNav categories={categories} activeSection="blog" />

          <main className="flex min-w-0 flex-col gap-[18px]">
            <Link href="/blog" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-medium text-ink-3 hover:text-brand-text">
              <IconArrowLeft className="icon" />
              Tous les billets
            </Link>

            <article className="rounded-card border border-hairline bg-surface p-6 shadow-card">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-3">
                {post.author?.is_redaction && (
                  <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full bg-redac-soft px-[9px] text-[11.5px] font-semibold text-redac">
                    Rédaction
                  </span>
                )}
                {post.category && (
                  <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full border border-hairline px-[9px] text-[11.5px] font-medium text-ink-3">
                    {post.category.name}
                  </span>
                )}
                <span className="text-line-strong" aria-hidden="true">·</span>
                <time dateTime={post.createdAt}>
                  {dateTimeFmt.format(new Date(post.createdAt))}
                </time>
              </div>

              <h1 className="mt-3 font-display text-[27px] font-bold leading-[1.25] tracking-[-0.015em]">
                {post.title}
              </h1>

              <p className="mt-3.5 flex items-center gap-2.5 text-[13px] text-ink-3">
                <Avatar username={authorName} size="sm" />
                <span>
                  par <span className="font-semibold text-ink-2">{authorName}</span>
                </span>
              </p>

              <div className="mt-4 whitespace-pre-line border-t border-hairline pt-4 text-[15px] leading-[1.65]">
                {post.body}
              </div>

              <div className="mt-4 flex items-center gap-2.5">
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
