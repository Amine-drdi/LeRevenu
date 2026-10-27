import Link from 'next/link';

import CategoryFilter from '@/components/CategoryFilter';
import DiscussionCard from '@/components/DiscussionCard';
import Header from '@/components/Header';
import { IconCheck, IconPlus } from '@/components/icons';
import Pagination from '@/components/Pagination';
import SideNav from '@/components/SideNav';
import SortSelect from '@/components/SortSelect';
import { getCategories, getDiscussions } from '@/lib/api';

/**
 * Accueil (Server Component) — rendu initial côté serveur.
 * Filtre (catégorie), tri et pagination sont appliqués côté Strapi via
 * les search params ; aucune donnée codée en dur.
 */
const SORTS = {
  recentes: 'createdAt:desc',
  anciennes: 'createdAt:asc',
} as const;

type SortKey = keyof typeof SORTS;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const categorie = typeof sp.categorie === 'string' && sp.categorie ? sp.categorie : undefined;
  const tri: SortKey = sp.tri === 'anciennes' ? 'anciennes' : 'recentes';
  const parsedPage = Number.parseInt(String(sp.page ?? '1'), 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const [categories, discussions] = await Promise.all([
    getCategories(),
    getDiscussions({ category: categorie, sort: SORTS[tri], page, pageSize: 10 }),
  ]);

  const { data, meta } = discussions;
  const total = meta.pagination.total;

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="layout">
          <SideNav categories={categories} active={categorie} />

          <main className="main">
            <div className="page-head">
              <div>
                <h1 className="page-title">Discussions</h1>
                <p className="page-sub">
                  {total} discussion{total > 1 ? 's' : ''} entre passionnés de finance
                </p>
              </div>
            </div>

            <div className="toolbar">
              <CategoryFilter categories={categories} active={categorie} />
              <SortSelect value={tri} category={categorie} />
            </div>

            {data.length === 0 ? (
              <div className="empty">
                <p className="t">Cet espace est encore vide</p>
                <p>
                  <Link href="/discussions/nouvelle">Lancez la première discussion →</Link>
                </p>
              </div>
            ) : (
              <>
                {data.map((discussion) => (
                  <DiscussionCard key={discussion.documentId} discussion={discussion} />
                ))}
                <Pagination
                  page={meta.pagination.page}
                  pageCount={meta.pagination.pageCount}
                  category={categorie}
                  sort={tri}
                />
              </>
            )}
          </main>

          <aside className="right">
            <section className="card">
              <h2 className="card-title">Bienvenue dans la communauté</h2>
              <p className="rail-p">
                Un projet d’investissement, une question fiscale, une analyse à partager ?
                Échangez avec les lecteurs du Revenu.
              </p>
              <div className="rail-cta">
                <Link href="/discussions/nouvelle" className="btn btn-primary">
                  <IconPlus className="icon" />
                  Poser une question
                </Link>
              </div>
            </section>

            <section className="card">
              <h2 className="card-title">Les règles du jeu</h2>
              <ul className="rail-list">
                <li>
                  <IconCheck className="icon" />
                  Restez courtois : critiquez les idées, jamais les personnes.
                </li>
                <li>
                  <IconCheck className="icon" />
                  Précisez vos sources quand vous avancez des chiffres.
                </li>
                <li>
                  <IconCheck className="icon" />
                  Aucune recommandation personnalisée : partagez votre expérience, pas du conseil.
                </li>
              </ul>
            </section>
          </aside>
        </div>

        <footer className="foot">
          <span>© Le Revenu — Communauté des lecteurs</span>
          <span className="sep" aria-hidden="true">
            ·
          </span>
          <a href="https://www.lerevenu.com" target="_blank" rel="noreferrer">
            lerevenu.com
          </a>
          <span className="grow" />
          <span className="muted">Forum de démonstration</span>
        </footer>
      </div>
    </div>
  );
}
