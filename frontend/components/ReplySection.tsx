'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import { IconCheck } from '@/components/icons';
import { useAuth } from '@/context/AuthContext';
import { createReply } from '@/lib/api';
import type { Reply } from '@/types';

const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

const REPLY =
  'rounded-card border border-hairline bg-surface px-4 py-3.5 shadow-card';

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
  solutionDocumentId,
}: {
  discussionDocumentId: string;
  initialReplies: Reply[];
  solutionDocumentId?: string;
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
    <section>
      <h2 className="font-display text-[21px] font-bold tracking-[-0.01em]">
        Réponses <span className="font-sans text-[15px] font-medium text-ink-3">({replies.length})</span>
      </h2>

      {replies.length === 0 ? (
        <div className="mt-3.5 rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
          <p className="mb-1 font-display text-lg font-bold text-ink">Aucune réponse pour le moment</p>
          <p>Soyez le premier à partager votre expérience.</p>
        </div>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-3">
          {replies.map((reply) => {
            const authorName = reply.author?.username ?? 'anonyme';
            const isSolution = solutionDocumentId === reply.documentId;
            return (
              <li key={reply.documentId} className={REPLY}>
                <div className="flex items-center gap-2.5 text-[12.5px] text-ink-3">
                  <Avatar username={authorName} size="sm" />
                  <span className="font-semibold text-ink-2">{authorName}</span>
                  {isSolution && (
                    <span className="inline-flex h-[22px] items-center gap-[5px] rounded-full bg-ok-soft px-[9px] text-[11.5px] font-semibold text-ok">
                      <IconCheck className="h-3 w-3" />
                      Meilleure réponse
                    </span>
                  )}
                  <time className="ml-auto" dateTime={reply.createdAt}>
                    {dateTimeFmt.format(new Date(reply.createdAt))}
                  </time>
                  <LikeButton
                    targetType="reply"
                    targetId={reply.documentId}
                    initialLikes={reply.likes ?? 0}
                    initialLiked={reply.likedByMe ?? false}
                  />
                </div>
                <p className="mt-2.5 whitespace-pre-line text-[14.5px] leading-[1.6]">{reply.content}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        {loading ? null : user ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="block text-[13px] font-medium text-ink-2">
              Votre réponse, {user.username}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Partagez votre analyse, votre expérience…"
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
                {pending ? 'Envoi…' : 'Publier la réponse'}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
            <p className="mb-1 font-display text-lg font-bold text-ink">Connectez-vous pour répondre</p>
            <p>
              <Link href="/connexion" className="font-semibold text-brand-text hover:underline">Se connecter</Link> et rejoindre la discussion.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
