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
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)_304px]">
          <SideNav categories={categories} active={categorie} />

          <main className="flex min-w-0 flex-col gap-[18px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-bold tracking-[-0.015em]">Discussions</h1>
                <p className="mt-0.5 text-sm text-ink-3">
                  {total} discussion{total > 1 ? 's' : ''} entre passionnés de finance
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 max-[720px]:flex-col max-[720px]:items-stretch">
              <CategoryFilter categories={categories} active={categorie} />
              <SortSelect value={tri} category={categorie} />
            </div>

            {data.length === 0 ? (
              <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
                <p className="mb-1 font-display text-lg font-bold text-ink">Cet espace est encore vide</p>
                <p>
                  <Link href="/discussions/nouvelle" className="font-semibold text-brand-text hover:underline">
                    Lancez la première discussion →
                  </Link>
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

          <aside className="flex min-w-0 flex-col gap-[18px]">
            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                Bienvenue dans la communauté
              </h2>
              <p className="text-[13.5px] leading-[1.55] text-ink-2">
                Un projet d’investissement, une question fiscale, une analyse à partager ?
                Échangez avec les lecteurs du Revenu.
              </p>
              <div className="mt-3.5 flex flex-col gap-2">
                <Link
                  href="/discussions/nouvelle"
                  className="inline-flex h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-ctl border border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand px-4 text-sm font-semibold text-white shadow-btn transition hover:brightness-95 active:scale-[0.98]"
                >
                  <IconPlus className="icon" />
                  Poser une question
                </Link>
              </div>
            </section>

            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                Les règles du jeu
              </h2>
              <ul className="flex flex-col gap-2.5 text-[13.5px] text-ink-2">
                <li className="flex items-start gap-2">
                  <IconCheck className="mt-0.5 h-[15px] w-[15px] flex-none text-brand-text" />
                  Restez courtois : critiquez les idées, jamais les personnes.
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="mt-0.5 h-[15px] w-[15px] flex-none text-brand-text" />
                  Précisez vos sources quand vous avancez des chiffres.
                </li>
                <li className="flex items-start gap-2">
                  <IconCheck className="mt-0.5 h-[15px] w-[15px] flex-none text-brand-text" />
                  Aucune recommandation personnalisée : partagez votre expérience, pas du conseil.
                </li>
              </ul>
            </section>
          </aside>
        </div>

        <footer className="mt-12 flex flex-wrap items-center gap-[18px] border-t border-hairline py-6 pb-10 text-[13px] text-ink-3">
          <span>© Le Revenu — Communauté des lecteurs</span>
          <span className="text-line-strong" aria-hidden="true">·</span>
          <a href="https://www.lerevenu.com" target="_blank" rel="noreferrer" className="hover:text-brand-text">
            lerevenu.com
          </a>
          <span className="ml-auto">Forum de démonstration</span>
        </footer>
      </div>
    </div>
  );
}
