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

  return (
    <nav aria-label="Pagination" className="pager">
      <Link
        href={href(page - 1)}
        aria-disabled={page <= 1}
        className={`pg ${page <= 1 ? 'off' : ''}`}
      >
        ← Précédent
      </Link>
      <span className="pg-info">
        Page {page} / {pageCount}
      </span>
      <Link
        href={href(page + 1)}
        aria-disabled={page >= pageCount}
        className={`pg ${page >= pageCount ? 'off' : ''}`}
      >
        Suivant →
      </Link>
    </nav>
  );
}
