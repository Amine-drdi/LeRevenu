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
      <h2 className="sec-title">
        Réponses <span className="muted">({replies.length})</span>
      </h2>

      {replies.length === 0 ? (
        <div className="empty" style={{ marginTop: 14 }}>
          <p className="t">Aucune réponse pour le moment</p>
          <p>Soyez le premier à partager votre expérience.</p>
        </div>
      ) : (
        <ul className="reply-list">
          {replies.map((reply) => {
            const authorName = reply.author?.username ?? 'anonyme';
            const isSolution = solutionDocumentId === reply.documentId;
            return (
              <li key={reply.documentId} className="reply">
                <div className="reply-h">
                  <Avatar username={authorName} size="sm" />
                  <span className="who">{authorName}</span>
                  {isSolution && (
                    <span className="chip chip-sol">
                      <IconCheck className="icon" style={{ width: 12, height: 12 }} />
                      Meilleure réponse
                    </span>
                  )}
                  <time dateTime={reply.createdAt}>
                    {dateTimeFmt.format(new Date(reply.createdAt))}
                  </time>
                  <LikeButton
                    targetType="reply"
                    targetId={reply.documentId}
                    initialLikes={reply.likes ?? 0}
                    initialLiked={reply.likedByMe ?? false}
                  />
                </div>
                <p className="reply-b">{reply.content}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: 24 }}>
        {loading ? null : user ? (
          <form onSubmit={onSubmit} className="form">
            <label className="fld">
              Votre réponse, {user.username}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Partagez votre analyse, votre expérience…"
                className="area"
              />
            </label>
            {error && <p className="alert">{error}</p>}
            <div className="form-actions">
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Envoi…' : 'Publier la réponse'}
              </button>
            </div>
          </form>
        ) : (
          <div className="empty">
            <p className="t">Connectez-vous pour répondre</p>
            <p>
              <Link href="/connexion">Se connecter</Link> et rejoindre la discussion.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
