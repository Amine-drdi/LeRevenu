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

  const pg =
    'inline-flex h-[34px] items-center gap-1.5 rounded-[9px] border border-hairline bg-surface px-3.5 text-[13.5px] font-medium text-ink-2 shadow-soft transition hover:bg-surface-2 hover:text-ink';

  return (
    <nav aria-label="Pagination" className="mt-1.5 flex items-center justify-center gap-2.5">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={`${pg} ${page <= 1 ? 'pointer-events-none opacity-45' : ''}`}
      >
        ← Précédent
      </Link>
      <span className="text-[13px] tabular-nums text-ink-3">
        Page {page} / {pageCount}
      </span>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= pageCount}
        className={`${pg} ${page >= pageCount ? 'pointer-events-none opacity-45' : ''}`}
      >
        Suivant →
      </Link>
    </nav>
  );
}
