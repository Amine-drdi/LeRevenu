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
        <div className="layout no-right">
          <SideNav categories={categories} activeSection="blog" />
          <main className="main">
            <div className="page-head">
              <div>
                <h1 className="page-title">Blog de la communauté</h1>
                <p className="page-sub">
                  Récits d’investissement et retours d’expérience écrits par les membres.
                </p>
              </div>
            </div>
            {posts.length === 0 ? (
              <div className="empty">
                <p className="t">Aucun billet pour le moment</p>
                <p>Le premier billet de la communauté arrive bientôt.</p>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.documentId} className="disc">
                  <div className="disc-top">
                    {post.author?.is_redaction && <span className="chip chip-redac">Rédaction</span>}
                    {post.category && <span className="chip chip-cat">{post.category.name}</span>}
                    <span className="sep" aria-hidden="true">·</span>
                    <time dateTime={post.createdAt}>{dateFmt.format(new Date(post.createdAt))}</time>
                  </div>
                  <h2 className="disc-t">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  <p className="disc-x">{post.body}</p>
                  <div className="disc-f">
                    <Avatar username={post.author?.username ?? 'anonyme'} size="sm" />
                    <span className="who">{post.author?.username ?? 'anonyme'}</span>
                    <span className="grow">
                      <IconHeart className="icon" />
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
