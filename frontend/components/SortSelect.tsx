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
    <label className="flex items-center gap-[7px] text-[13px] text-ink-3">
      Trier
      <select
        value={value}
        onChange={onChange}
        className="h-[30px] w-auto rounded-ctl border border-line bg-surface px-3 text-[13px] focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25"
      >
        <option value="recentes">Plus récentes</option>
        <option value="anciennes">Plus anciennes</option>
      </select>
    </label>
  );
}
