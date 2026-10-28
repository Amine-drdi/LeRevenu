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
    <span className="flex items-center gap-2.5">
      <button
        type="button"
        onClick={onToggle}
        disabled={pending}
        className={`inline-flex h-[30px] items-center justify-center gap-[7px] whitespace-nowrap rounded-lg border px-3 text-[13px] font-semibold transition active:scale-[0.98] ${
          going
            ? 'border-hairline bg-surface text-ink shadow-soft hover:bg-surface-2'
            : 'border-transparent bg-gradient-to-b from-[color-mix(in_srgb,#eb0f0f_82%,#fff)] to-brand text-white shadow-btn hover:brightness-95'
        }`}
        aria-pressed={going}
      >
        {going ? '✓ Je participe' : 'Je participe'}
      </button>
      <span className="text-[12.5px] tabular-nums text-ink-3">
        {count} participant{count > 1 ? 's' : ''}
      </span>
    </span>
  );
}
