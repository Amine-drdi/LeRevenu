'use client';

import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import Avatar from '@/components/Avatar';
import LikeButton from '@/components/LikeButton';
import { useAuth } from '@/context/AuthContext';
import { createReply } from '@/lib/api';
import type { BlogComment } from '@/types';

const dateTimeFmt = new Intl.DateTimeFormat('fr-FR', {
  dateStyle: 'long',
  timeStyle: 'short',
});

/**
 * Commentaires d'un billet de blog (Client Component) : liste + formulaire.
 * Même modèle que la section réponses d'une discussion — la cible est le
 * billet (`blog_post`), l'auteur est forcé côté Strapi depuis le JWT.
 */
export default function BlogCommentSection({
  blogDocumentId,
  initialComments,
}: {
  blogDocumentId: string;
  initialComments: BlogComment[];
}) {
  const { user, loading } = useAuth();
  const [comments, setComments] = useState<BlogComment[]>(initialComments);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (!content.trim()) {
      setError('Le commentaire est obligatoire.');
      return;
    }
    setPending(true);
    try {
      const created = await createReply({ content: content.trim(), blog_post: blogDocumentId });
      setComments((current) => [
        ...current,
        {
          documentId: created.documentId,
          content: created.content,
          createdAt: created.createdAt,
          author: created.author,
          likes: 0,
          likedByMe: false,
        },
      ]);
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
        Commentaires <span className="font-sans text-[15px] font-medium text-ink-3">({comments.length})</span>
      </h2>

      {comments.length === 0 ? (
        <div className="mt-3.5 rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
          <p className="mb-1 font-display text-lg font-bold text-ink">Aucun commentaire pour le moment</p>
          <p>Donnez votre avis sur ce billet.</p>
        </div>
      ) : (
        <ul className="mt-3.5 flex flex-col gap-3">
          {comments.map((comment) => {
            const authorName = comment.author?.username ?? 'anonyme';
            return (
              <li key={comment.documentId} className="rounded-card border border-hairline bg-surface px-4 py-3.5 shadow-card">
                <div className="flex items-center gap-2.5 text-[12.5px] text-ink-3">
                  <Avatar username={authorName} size="sm" />
                  <span className="font-semibold text-ink-2">{authorName}</span>
                  <time className="ml-auto" dateTime={comment.createdAt}>
                    {dateTimeFmt.format(new Date(comment.createdAt))}
                  </time>
                  <LikeButton
                    targetType="reply"
                    targetId={comment.documentId}
                    initialLikes={comment.likes}
                    initialLiked={comment.likedByMe}
                  />
                </div>
                <p className="mt-2.5 whitespace-pre-line text-[14.5px] leading-[1.6]">{comment.content}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div className="mt-6">
        {loading ? null : user ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <label className="block text-[13px] font-medium text-ink-2">
              Votre commentaire
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Réagissez à ce billet…"
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
                {pending ? 'Envoi…' : 'Publier le commentaire'}
              </button>
            </div>
          </form>
        ) : (
          <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
            <p className="mb-1 font-display text-lg font-bold text-ink">Connectez-vous pour commenter</p>
            <p>
              <Link href="/connexion" className="font-semibold text-brand-text hover:underline">Se connecter</Link> et rejoindre la conversation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
