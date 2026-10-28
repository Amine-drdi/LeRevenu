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
    <div className="poll" role="group" aria-label="Sondage">
      {poll.options.map((option, index) => {
        const pct = poll.total > 0 ? Math.round((option.votes / poll.total) * 100) : 0;
        if (!hasVoted) {
          return (
            <button
              key={index}
              type="button"
              className="poll-opt"
              disabled={pending}
              onClick={() => vote(index)}
            >
              {option.label}
            </button>
          );
        }
        return (
          <div key={index} className={`poll-res ${poll.myVote === index ? 'mine' : ''}`}>
            <span className="lbl">{option.label}</span>
            <span className="poll-track">
              <span className="poll-fill" style={{ width: `${pct}%` }} />
            </span>
            <span className="poll-pct">{pct} %</span>
          </div>
        );
      })}
      <p className="poll-foot">
        {poll.total} vote{poll.total > 1 ? 's' : ''}
        {hasVoted ? ' · vous pouvez changer votre vote' : ''}
      </p>
      {error && <p className="alert">Vote impossible pour le moment, réessayez.</p>}
    </div>
  );
}
