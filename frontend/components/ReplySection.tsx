'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { useAuth } from '@/context/AuthContext';
import { createReply } from '@/lib/api';
import type { Reply } from '@/types';

const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

/**
 * Section réponses d'une discussion (Client Component) : liste + formulaire.
 *
 * La liste est initialisée côté serveur (SSR) puis gérée en état local : la
 * réponse publiée s'affiche immédiatement, sans attendre la revalidation ISR
 * du fetch serveur (60 s, voir lib/api.ts). L'auteur est forcé côté Strapi
 * depuis le JWT — le body n'envoie que le contenu et la discussion cible.
 */
export default function ReplySection({
  discussionDocumentId,
  initialReplies,
}: {
  discussionDocumentId: string;
  initialReplies: Reply[];
}) {
  const { user, loading } = useAuth();
  const [replies, setReplies] = useState<Reply[]>(initialReplies);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!content.trim()) {
      setError('Le contenu de la réponse est obligatoire.');
      return;
    }

    setPending(true);
    try {
      const created = await createReply({
        content: content.trim(),
        discussion: discussionDocumentId,
      });
      setReplies((current) => [...current, created]);
      setContent('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Une erreur est survenue.');
    } finally {
      setPending(false);
    }
  };

  return (
    <section className="mt-10">
      <h2 className="font-serif text-2xl text-white">
        Réponses <span className="text-zinc-500">({replies.length})</span>
      </h2>

      {replies.length === 0 ? (
        <p className="mt-4 rounded-lg border border-dashed border-zinc-700 p-8 text-center text-sm text-zinc-500">
          Aucune réponse pour le moment.
        </p>
      ) : (
        <ul className="mt-4 space-y-4">
          {replies.map((reply) => (
            <li key={reply.documentId} className="rounded-lg border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between text-xs text-zinc-500">
                <span className="font-medium text-zinc-300">
                  {reply.author?.username ?? 'anonyme'}
                </span>
                <span>{dateTimeFmt.format(new Date(reply.createdAt))}</span>
              </div>
              <p className="mt-3 whitespace-pre-line text-sm text-zinc-200">{reply.content}</p>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-8">
        {loading ? null : user ? (
          <form onSubmit={onSubmit} className="space-y-3">
            <label className="block text-sm text-zinc-300">
              Votre réponse, {user.username}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Partagez votre analyse, votre expérience…"
                className="mt-1 w-full resize-y rounded border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:border-brand focus:outline-none"
              />
            </label>
            {error && (
              <p className="rounded-lg border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand-light">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={pending}
              className="rounded bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              {pending ? 'Envoi…' : 'Publier la réponse'}
            </button>
          </form>
        ) : (
          <p className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-center text-sm text-zinc-500">
            Connectez-vous pour répondre —{' '}
            <Link href="/connexion" className="text-brand-light hover:underline">
              se connecter
            </Link>
          </p>
        )}
      </div>
    </section>
  );
}
