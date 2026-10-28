'use client';

import { useState } from 'react';

import { toggleRsvp } from '@/lib/api';

/**
 * Bouton « Je participe » d'un événement (Client Component) : bascule le RSVP
 * du membre connecté et affiche le nombre de participants en direct.
 */
export default function RsvpButton({
  eventDocumentId,
  initialGoing,
  initialCount,
}: {
  eventDocumentId: string;
  initialGoing: boolean;
  initialCount: number;
}) {
  const [going, setGoing] = useState(initialGoing);
  const [count, setCount] = useState(initialCount);
  const [pending, setPending] = useState(false);

  const onToggle = async () => {
    if (pending) return;
    setPending(true);
    try {
      const result = await toggleRsvp(eventDocumentId);
      setGoing(result.going);
      setCount(result.participants);
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 401) {
        window.location.href = '/connexion';
        return;
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <span className="like-row">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={`btn btn-sm ${going ? 'btn-secondary' : 'btn-primary'}`}
        aria-pressed={going}
      >
        {going ? '✓ Je participe' : 'Je participe'}
      </button>
      <span className="muted num" style={{ fontSize: 12.5 }}>
        {count} participant{count > 1 ? 's' : ''}
      </span>
    </span>
  );
}
