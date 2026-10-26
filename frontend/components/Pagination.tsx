import Link from 'next/link';

/**
 * Pagination (Server Component) — pilotée par la méta Strapi
 * (`meta.pagination`), paramètres de filtre/tri préservés dans les liens.
 */
export default function Pagination({
  page,
  pageCount,
  category,
  sort,
}: {
  page: number;
  pageCount: number;
  category?: string;
  sort?: string;
}) {
  if (pageCount <= 1) return null;

  const href = (target: number) => {
    const params = new URLSearchParams();
    if (category) params.set('categorie', category);
    if (sort && sort !== 'recentes') params.set('tri', sort);
    if (target > 1) params.set('page', String(target));
    const query = params.toString();
    return query ? `/?${query}` : '/';
  };

  const item = (target: number, label: string, disabled: boolean, active = false) =>
    disabled ? (
      <span
        key={`${label}-${target}`}
        className="rounded border border-zinc-800 px-3 py-1.5 text-sm text-zinc-600"
      >
        {label}
      </span>
    ) : (
      <Link
        key={`${label}-${target}`}
        href={href(target)}
        aria-current={active ? 'page' : undefined}
        className={
          active
            ? 'rounded border border-brand bg-brand px-3 py-1.5 text-sm font-semibold text-white'
            : 'rounded border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 transition hover:border-zinc-500 hover:text-white'
        }
      >
        {label}
      </Link>
    );

  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-center gap-2">
      {item(page - 1, '← Précédent', page <= 1)}
      <span className="px-2 text-sm text-zinc-500">
        Page {page} / {pageCount}
      </span>
      {item(page + 1, 'Suivant →', page >= pageCount)}
    </nav>
  );
}
