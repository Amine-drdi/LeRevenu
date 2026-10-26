import CategoryFilter from '@/components/CategoryFilter';
import DiscussionCard from '@/components/DiscussionCard';
import Header from '@/components/Header';
import Pagination from '@/components/Pagination';
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="mb-8">
          <h1 className="font-serif text-4xl text-white">Discussions</h1>
          <p className="mt-2 text-zinc-400">
            {meta.pagination.total} discussion{meta.pagination.total > 1 ? 's' : ''} entre
            passionnés de finance.
          </p>
        </div>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <CategoryFilter categories={categories} active={categorie} />
          <SortSelect value={tri} category={categorie} />
        </div>

        {data.length === 0 ? (
          <div className="rounded-lg border border-dashed border-zinc-700 p-12 text-center text-zinc-500">
            Aucune discussion dans cette catégorie pour le moment.
            <br />
            <a href="/discussions/nouvelle" className="mt-2 inline-block text-brand-light hover:underline">
              Soyez le premier à en créer une →
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            {data.map((discussion) => (
              <DiscussionCard key={discussion.documentId} discussion={discussion} />
            ))}
          </div>
        )}

        <Pagination
          page={meta.pagination.page}
          pageCount={meta.pagination.pageCount}
          category={categorie}
          sort={tri}
        />
      </main>
    </div>
  );
}
