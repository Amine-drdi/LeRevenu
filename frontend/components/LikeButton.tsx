'use client';

import { useState } from 'react';

import { IconHeart } from '@/components/icons';
import { toggleLike } from '@/lib/api';

/**
 * Bascule « Utile » sur une cible (discussion, réponse ou billet).
 * État local mis à jour depuis la réponse de l'API ; 401 si non connecté
 * → renvoi vers /connexion, comme les formulaires.
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
    <span className="flex items-center gap-2">
      <button
        type="button"
        onClick={onToggle}
        className={`inline-flex h-[30px] items-center gap-1.5 rounded-full border px-[11px] text-[12.5px] font-semibold transition ${
          liked
            ? 'border-transparent bg-brand-soft text-brand-text'
            : 'border-hairline bg-surface text-ink-2 hover:border-line-strong hover:text-ink'
        }`}
        aria-pressed={liked}
      >
        <IconHeart className="h-[14px] w-[14px]" />
        Utile · {likes}
      </button>
      {error && <span className="text-xs text-ink-3">Erreur, réessayez.</span>}
    </span>
  );
}
