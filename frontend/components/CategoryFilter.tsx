import Link from 'next/link';

import type { Category } from '@/types';

/**
 * Filtre par catégorie (Server Component) : liens vers l'accueil avec le
 * paramètre `?categorie=` — le filtrage est exécuté côté Strapi.
 */
export default function CategoryFilter({
  categories,
  active,
}: {
  categories: Category[];
  active?: string;
}) {
  const link = (slug: string, label: string, isActive: boolean) => (
    <Link
      key={slug || 'all'}
      href={slug ? `/?categorie=${encodeURIComponent(slug)}` : '/'}
      className={
        isActive
          ? 'rounded-full bg-brand px-3 py-1.5 text-sm font-semibold text-white'
          : 'rounded-full border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white'
      }
    >
      {label}
    </Link>
  );

  return (
    <div className="flex flex-wrap gap-2">
      {link('', 'Toutes', !active)}
      {categories.map((category) => link(category.slug, category.name, active === category.slug))}
    </div>
  );
}
