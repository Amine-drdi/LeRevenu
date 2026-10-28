'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { createDiscussion, getCategories } from '@/lib/api';
import type { Category, DiscussionType } from '@/types';

const SEG = 'grid h-8 place-items-center rounded-lg text-[13.5px] font-medium text-ink-2 transition hover:text-ink';
const SEG_ON = 'bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.14)]';

/**
 * Création d'une discussion (Client Component).
 *
 * L'auteur n'est PAS envoyé : le backend le force depuis le JWT
 * (anti-usurpation, voir backend/src/api/discussion/controllers/discussion.ts).
 * La validation côté client reflète la règle métier serveur (titre ≥ 10) mais
 * la décision finale reste à Strapi — ses erreurs 400 sont affichées telles quelles.
 */
export default function NouvelleDiscussionPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<DiscussionType>('discussion');
  const [category, setCategory] = useState('');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  // Les catégories sont publiques : fetch navigateur (endpoint GET /categories).
  useEffect(() => {
    getCategories()
      .then((list) => {
        setCategories(list);
        setCategory((current) => current || (list[0]?.documentId ?? ''));
      })
      .catch(() => setError('Impossible de charger les catégories.'));
  }, []);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (title.trim().length < 10) {
      setError('Le titre doit contenir au moins 10 caractères.');
      return;
    }
    if (!content.trim()) {
      setError('Le contenu est obligatoire.');
      return;
    }

    setPending(true);
    try {
      const created = await createDiscussion({
        title: title.trim(),
        content: content.trim(),
        type,
        category,
      });
      router.push(`/discussions/${created.slug}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
      setPending(false);
    }
  };

  // Hydratation du contexte d'auth : éviter un flash « connectez-vous ».
  if (authLoading) {
    return (
      <div>
        <Header />
        <div className="wrap">
          <div className="mx-auto flex max-w-[680px] flex-col gap-5 py-8 pb-24">
            <div className="skel h-9 max-w-[320px]" />
            <div className="skel h-[420px]" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div>
        <Header />
        <div className="wrap">
          <div className="mx-auto flex max-w-[680px] flex-col gap-5 py-8 pb-24">
            <h1 className="text-center font-display text-[28px] font-bold tracking-[-0.015em]">Nouvelle discussion</h1>
            <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
              <p className="mb-1 font-display text-lg font-bold text-ink">Connectez-vous pour participer</p>
              <p>
                <Link href="/connexion" className="font-semibold text-brand-text hover:underline">Se connecter</Link> ou créer un compte, puis lancez votre discussion.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="mx-auto flex max-w-[680px] flex-col gap-5 py-8 pb-24">
          <div>
            <h1 className="font-display text-[28px] font-bold tracking-[-0.015em]">Nouvelle discussion</h1>
            <p className="mt-0.5 text-sm text-ink-3">
              Partagez une question ou un sujet avec la communauté.
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="block text-[13px] font-medium text-ink-2">
              Type
              <div className="mt-1.5 grid auto-cols-fr grid-flow-col gap-[3px] rounded-[10px] bg-fill p-[3px]">
                {(
                  [
                    ['discussion', 'Discussion'],
                    ['question', 'Question'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={`${SEG} ${type === value ? SEG_ON : ''}`}
                    onClick={() => setType(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </label>

            <label className="block text-[13px] font-medium text-ink-2">
              Espace
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="mt-1.5 h-[38px] w-full rounded-ctl border border-line bg-surface px-3 text-sm transition focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25"
              >
                {categories.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-[13px] font-medium text-ink-2">
              Titre
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={10}
                placeholder="Un titre explicite (10 caractères minimum)"
                className="mt-1.5 h-[38px] w-full rounded-ctl border border-line bg-surface px-3 text-sm transition focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25"
              />
            </label>

            <label className="block text-[13px] font-medium text-ink-2">
              Contenu
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                placeholder="Détaillez votre question ou votre sujet…"
                className="mt-1.5 w-full resize-y rounded-ctl border border-line bg-surface px-3 py-2.5 text-sm leading-normal transition focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/25"
              />
            </label>

            {error && (
              <p className="flex items-start gap-2 rounded-ctl border border-[color-mix(in_srgb,var(--alert)_30%,transparent)] bg-[var(--alert-soft)] px-3 py-2.5 text-[13.5px] text-[var(--alert)]">
                {error}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-3.5">
              <button type="submit" disabled={pending} className="inline-flex h-9 items-center justify-center gap-[7px] whitespace-nowrap rounded-ctl border border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand px-4 text-sm font-semibold text-white shadow-btn transition hover:brightness-95 active:scale-[0.98] disabled:opacity-50">
                {pending ? 'Publication…' : 'Publier la discussion'}
              </button>
              <Link href="/" className="inline-flex h-9 items-center justify-center rounded-ctl px-4 text-sm font-semibold text-ink-2 transition hover:bg-fill hover:text-ink">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
