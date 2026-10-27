import Link from 'next/link';

import type { Category } from '@/types';

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
      className={`chip-f ${isActive ? 'on' : ''}`}
    >
      {label}
    </Link>
  );

  return (
    <div className="chips">
      {link('', 'Toutes', !active)}
      {categories.map((category) => link(category.slug, category.name, active === category.slug))}
    </div>
  );
}
