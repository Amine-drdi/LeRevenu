'use client';

import { useState } from 'react';

import { castPollVote } from '@/lib/api';
import type { Poll } from '@/types';

/**
 * Sondage d'une discussion (Client Component) : vote en un clic, résultats
 * en barres dès que l'utilisateur a voté (une voix, changeable — voir API).
 */
export default function PollSection({
  discussionDocumentId,
  initialPoll,
}: {
  discussionDocumentId: string;
  initialPoll: Poll;
}) {
  const [poll, setPoll] = useState(initialPoll);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);

  const vote = async (index: number) => {
    if (pending) return;
    setPending(true);
    setError(false);
    try {
      const result = await castPollVote(discussionDocumentId, index);
      setPoll({
        options: poll.options.map((option, i) => ({ ...option, votes: result.tally[i] ?? 0 })),
        total: result.total,
        myVote: result.myVote,
      });
    } catch (err) {
      if (err instanceof Error && 'status' in err && (err as { status: number }).status === 401) {
        window.location.href = '/connexion';
        return;
      }
      setError(true);
    } finally {
      setPending(false);
    }
  };

  const hasVoted = poll.myVote != null;

  return (
    <div className="mt-4 flex flex-col gap-2" role="group" aria-label="Sondage">
      {poll.options.map((option, index) => {
        const pct = poll.total > 0 ? Math.round((option.votes / poll.total) * 100) : 0;
        if (!hasVoted) {
          return (
            <button
              key={index}
              type="button"
              className="flex w-full items-center gap-2.5 rounded-ctl border border-line bg-surface px-3.5 py-2.5 text-left text-sm transition hover:border-brand hover:bg-surface-3"
              disabled={pending}
              onClick={() => vote(index)}
            >
              {option.label}
            </button>
          );
        }
        const mine = poll.myVote === index;
        return (
          <div key={index} className="flex items-center gap-2.5 text-[13.5px]">
            <span className={`max-w-[40%] flex-none ${mine ? 'font-bold text-brand-text' : ''}`}>
              {option.label}
            </span>
            <span className="h-2 flex-1 overflow-hidden rounded-full bg-fill">
              <span
                className="block h-full rounded-full bg-gradient-to-r from-[color-mix(in_srgb,#eb0f0f_75%,#fff)] to-brand"
                style={{ width: `${pct}%` }}
              />
            </span>
            <span className="w-11 flex-none text-right font-bold tabular-nums text-ink-2">
              {pct} %
            </span>
          </div>
        );
      })}
      <p className="text-[12.5px] text-ink-3">
        {poll.total} vote{poll.total > 1 ? 's' : ''}
        {hasVoted ? ' · vous pouvez changer votre vote' : ''}
      </p>
      {error && (
        <p className="flex items-start gap-2 rounded-ctl border border-[color-mix(in_srgb,var(--alert)_30%,transparent)] bg-[var(--alert-soft)] px-3 py-2.5 text-[13.5px] text-[var(--alert)]">
          Vote impossible pour le moment, réessayez.
        </p>
      )}
    </div>
  );
}
