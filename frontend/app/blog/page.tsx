import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import { IconHeart } from '@/components/icons';
import SideNav from '@/components/SideNav';
import { getBlogPosts, getCategories } from '@/lib/api';

export const metadata = { title: 'Blog de la communauté — Le Revenu' };
/** Données vivantes : rendu à la demande (pas de pré-rendu au build). */
export const dynamic = 'force-dynamic';

const dateFmt = new Intl.DateTimeFormat('fr-FR', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
});

/** Blog communautaire (Server Component) — billets publics avec réactions. */
export default async function BlogPage() {
  const [categories, posts] = await Promise.all([getCategories(), getBlogPosts()]);

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)]">
          <SideNav categories={categories} activeSection="blog" />
          <main className="flex min-w-0 flex-col gap-[18px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-bold tracking-[-0.015em]">Blog de la communauté</h1>
                <p className="mt-0.5 text-sm text-ink-3">
                  Récits d’investissement et retours d’expérience écrits par les membres.
                </p>
              </div>
            </div>
            {posts.length === 0 ? (
              <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
                <p className="mb-1 font-display text-lg font-bold text-ink">Aucun billet pour le moment</p>
                <p>Le premier billet de la communauté arrive bientôt.</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.documentId} className="block rounded-card border border-hairline bg-surface px-[18px] py-4 shadow-card transition hover:-translate-y-px hover:border-line-strong hover:shadow-lift">
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
                    <time dateTime={post.createdAt}>{dateFmt.format(new Date(post.createdAt))}</time>
                  </div>
                  <h2 className="mt-2 font-display text-[18px] font-bold leading-[1.3] tracking-[-0.01em]">
                    <Link href={`/blog/${post.slug}`} className="hover:text-brand-text">
                      {post.title}
                    </Link>
                  </h2>
                  <p className="mt-1 line-clamp-2 whitespace-pre-line text-[13.5px] leading-normal text-ink-3">
                    {post.body}
                  </p>
                  <div className="mt-3 flex items-center gap-2 text-[12.5px] text-ink-3">
                    <Avatar username={post.author?.username ?? 'anonyme'} size="sm" />
                    <span className="font-semibold text-ink-2">{post.author?.username ?? 'anonyme'}</span>
                    <span className="ml-auto inline-flex items-center gap-1.5">
                      <IconHeart className="h-[15px] w-[15px]" />
                      {post.likes} « Utile »
                    </span>
                  </div>
                </article>
              ))
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
