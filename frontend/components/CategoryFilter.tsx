import Link from 'next/link';

import type { Category } from '@/types';

const CHIP_F =
  'inline-flex h-[30px] items-center rounded-full border border-hairline bg-surface px-[13px] text-[13px] font-medium text-ink-2 transition hover:bg-surface-2 hover:text-ink';

/**
 * Filtre par catégorie (Server Component) : puces vers l'accueil avec le
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
      className={`${CHIP_F} ${isActive ? 'border-transparent bg-brand font-semibold text-white' : ''}`}
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
