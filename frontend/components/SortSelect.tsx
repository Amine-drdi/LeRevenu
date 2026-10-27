'use client';

import { useRouter } from 'next/navigation';

/**
 * Tri de la liste (Client Component) : met à jour le paramètre `?tri=`
 * dans l'URL — le tri reste exécuté côté Strapi (`sort=createdAt:…`).
 */
export default function SortSelect({ value, category }: { value: string; category?: string }) {
  const router = useRouter();

  const onChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams();
    if (category) params.set('categorie', category);
    if (event.target.value !== 'recentes') params.set('tri', event.target.value);
    const query = params.toString();
    router.push(query ? `/?${query}` : '/');
  };

  return (
    <label className="tool-label">
      Trier
      <select
        value={value}
        onChange={onChange}
        className="select inline"
      >
        <option value="recentes">Plus récentes</option>
        <option value="anciennes">Plus anciennes</option>
      </select>
    </label>
  );
}
