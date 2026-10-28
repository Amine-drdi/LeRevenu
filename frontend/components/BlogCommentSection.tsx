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
      <h2 className="sec-title">
        Commentaires <span className="muted">({comments.length})</span>
      </h2>

      {comments.length === 0 ? (
        <div className="empty" style={{ marginTop: 14 }}>
          <p className="t">Aucun commentaire pour le moment</p>
          <p>Donnez votre avis sur ce billet.</p>
        </div>
      ) : (
        <ul className="reply-list">
          {comments.map((comment) => {
            const authorName = comment.author?.username ?? 'anonyme';
            return (
              <li key={comment.documentId} className="reply">
                <div className="reply-h">
                  <Avatar username={authorName} size="sm" />
                  <span className="who">{authorName}</span>
                  <time dateTime={comment.createdAt}>
                    {dateTimeFmt.format(new Date(comment.createdAt))}
                  </time>
                  <LikeButton
                    targetType="reply"
                    targetId={comment.documentId}
                    initialLikes={comment.likes}
                    initialLiked={comment.likedByMe}
                  />
                </div>
                <p className="reply-b">{comment.content}</p>
              </li>
            );
          })}
        </ul>
      )}

      <div style={{ marginTop: 24 }}>
        {loading ? null : user ? (
          <form onSubmit={onSubmit} className="form">
            <label className="fld">
              Votre commentaire
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                required
                rows={5}
                placeholder="Réagissez à ce billet…"
                className="area"
              />
            </label>
            {error && <p className="alert">{error}</p>}
            <div className="form-actions">
              <button type="submit" disabled={pending} className="btn btn-primary">
                {pending ? 'Envoi…' : 'Publier le commentaire'}
              </button>
            </div>
          </form>
        ) : (
          <div className="empty">
            <p className="t">Connectez-vous pour commenter</p>
            <p>
              <Link href="/connexion">Se connecter</Link> et rejoindre la conversation.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
