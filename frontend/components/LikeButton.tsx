'use client';

import { useState } from 'react';

import { IconHeart } from '@/components/icons';
import { toggleLike } from '@/lib/api';

/**
 * Bascule « Utile » sur une cible (discussion, réponse ou billet).
 * 401 si non connecté → renvoi vers /connexion, comme les formulaires.
 */
export default function LikeButton({
  targetType,
  targetId,
  initialLikes,
  initialLiked,
}: {
  targetType: 'discussion' | 'reply' | 'blog-post';
  targetId: string;
  initialLikes: number;
  initialLiked: boolean;
}) {
  const [likes, setLikes] = useState(initialLikes);
  const [liked, setLiked] = useState(initialLiked);
  const [error, setError] = useState(false);

  const onToggle = async () => {
    setError(false);
    try {
      const result = await toggleLike(targetType, targetId);
      setLiked(result.liked);
      setLikes(result.likes);
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 401) {
        window.location.href = '/connexion';
        return;
      }
      setError(true);
    }
  };

  return (
    <span className="like-row">
      <button
        type="button"
        onClick={onToggle}
        className={`like-btn ${liked ? 'on' : ''}`}
        aria-pressed={liked}
      >
        <IconHeart className="icon" />
        Utile · {likes}
      </button>
      {error && <span className="muted" style={{ fontSize: 12 }}>Erreur, réessayez.</span>}
    </span>
  );
}
