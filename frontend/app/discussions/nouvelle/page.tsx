'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { createDiscussion, getCategories } from '@/lib/api';
import type { Category, DiscussionType } from '@/types';

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

  const field =
    'w-full rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-brand focus:outline-none';

  // Hydratation du contexte d'auth : éviter un flash « connectez-vous ».
  if (authLoading) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-10">
          <div className="h-10 w-72 animate-pulse rounded bg-zinc-800" />
          <div className="mt-6 h-96 animate-pulse rounded-lg bg-zinc-900" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-3xl px-4 py-24 text-center">
          <h1 className="font-serif text-3xl text-white">Nouvelle discussion</h1>
          <p className="mt-4 text-zinc-400">
            Connectez-vous pour créer une discussion —{' '}
            <Link href="/connexion" className="text-brand-light hover:underline">
              se connecter
            </Link>
            .
          </p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-serif text-3xl text-white">Nouvelle discussion</h1>

        <form onSubmit={onSubmit} className="mt-8 space-y-5">
          <div className="flex flex-wrap gap-4">
            <label className="block text-sm text-zinc-300">
              Type
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DiscussionType)}
                className={`mt-1 ${field}`}
              >
                <option value="discussion">Discussion</option>
                <option value="question">Question</option>
              </select>
            </label>
            <label className="block min-w-52 flex-1 text-sm text-zinc-300">
              Catégorie
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className={`mt-1 ${field}`}
              >
                {categories.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block text-sm text-zinc-300">
            Titre
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              minLength={10}
              placeholder="Un titre explicite (10 caractères minimum)"
              className={`mt-1 ${field}`}
            />
          </label>

          <label className="block text-sm text-zinc-300">
            Contenu
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={10}
              placeholder="Détaillez votre question ou votre sujet…"
              className={`mt-1 resize-y ${field}`}
            />
          </label>

          {error && (
            <p className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand-light">
              {error}
            </p>
          )}

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Publication…' : 'Publier la discussion'}
            </button>
            <Link href="/" className="text-sm text-zinc-400 transition hover:text-white">
              Annuler
            </Link>
          </div>
        </form>
      </main>
    </div>
  );
}
