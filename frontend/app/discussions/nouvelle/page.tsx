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

  // Hydratation du contexte d'auth : éviter un flash « connectez-vous ».
  if (authLoading) {
    return (
      <div>
        <Header />
        <div className="wrap">
          <div className="center-page">
            <div className="skel" style={{ height: 36, maxWidth: 320 }} />
            <div className="skel" style={{ height: 420 }} />
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
          <div className="center-page" style={{ textAlign: 'center' }}>
            <h1 className="page-title">Nouvelle discussion</h1>
            <div className="empty">
              <p className="t">Connectez-vous pour participer</p>
              <p>
                <Link href="/connexion">Se connecter</Link> ou créer un compte, puis lancez
                votre discussion.
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
        <div className="center-page">
          <div>
            <h1 className="page-title">Nouvelle discussion</h1>
            <p className="page-sub">
              Partagez une question ou un sujet avec la communauté.
            </p>
          </div>

          <form onSubmit={onSubmit} className="form">
            <label className="fld">
              Type
              <div className="seg" style={{ marginTop: 6 }}>
                {(
                  [
                    ['discussion', 'Discussion'],
                    ['question', 'Question'],
                  ] as const
                ).map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={type === value ? 'on' : ''}
                    onClick={() => setType(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </label>

            <label className="fld">
              Espace
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
                className="select"
              >
                {categories.map((c) => (
                  <option key={c.documentId} value={c.documentId}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="fld">
              Titre
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={10}
                placeholder="Un titre explicite (10 caractères minimum)"
                className="input"
              />
            </label>

            <label className="fld">
              Contenu
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={10}
                placeholder="Détaillez votre question ou votre sujet…"
                className="area"
              />
            </label>

            {error && <p className="alert">{error}</p>}

            <div className="form-actions">
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Publication…' : 'Publier la discussion'}
              </button>
              <Link href="/" className="btn btn-quiet">
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
