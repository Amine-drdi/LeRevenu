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
    <label className="flex items-center gap-2 text-sm text-zinc-400">
      Trier
      <select
        value={value}
        onChange={onChange}
        className="rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-brand focus:outline-none"
      >
        <option value="recentes">Plus récentes</option>
        <option value="anciennes">Plus anciennes</option>
      </select>
    </label>
  );
}
