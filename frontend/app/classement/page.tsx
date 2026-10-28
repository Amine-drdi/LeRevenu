import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import SideNav from '@/components/SideNav';
import { getCategories, getLeaderboard } from '@/lib/api';

export const metadata = { title: 'Classement des membres — Le Revenu' };
/** Données vivantes : rendu à la demande (pas de pré-rendu au build). */
export const dynamic = 'force-dynamic';

const SEG = 'grid h-8 place-items-center rounded-lg text-[13.5px] font-medium text-ink-2 transition hover:text-ink';
const SEG_ON = 'bg-surface font-semibold text-ink shadow-[0_1px_3px_rgba(0,0,0,0.14)]';

/**
 * Classement (Server Component) — points du mois par défaut, cumul via
 * `?period=all`. Les points sont calculés côté API depuis l'activité réelle.
 */
export default async function ClassementPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const period = sp.period === 'all' ? 'all' : 'month';
  const [categories, board] = await Promise.all([getCategories(), getLeaderboard(period)]);

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)_304px]">
          <SideNav categories={categories} activeSection="classement" />

          <main className="flex min-w-0 flex-col gap-[18px]">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <h1 className="font-display text-[28px] font-bold tracking-[-0.015em]">Classement</h1>
                <p className="mt-0.5 text-sm text-ink-3">
                  Les points se gagnent en contribuant : réponses, discussions,
                  billets, « Utile » reçus, meilleures réponses, votes.
                </p>
              </div>
              <div className="grid w-[220px] auto-cols-fr grid-flow-col gap-[3px] rounded-[10px] bg-fill p-[3px]">
                <Link href="/classement" className={`${SEG} ${period === 'month' ? SEG_ON : ''}`}>
                  Ce mois-ci
                </Link>
                <Link href="/classement?period=all" className={`${SEG} ${period === 'all' ? SEG_ON : ''}`}>
                  Général
                </Link>
              </div>
            </div>

            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              {board.rows.length === 0 ? (
                <div className="rounded-card border-[1.5px] border-dashed border-line-strong bg-surface/50 p-11 text-center text-sm text-ink-3">
                  <p className="mb-1 font-display text-lg font-bold text-ink">Pas encore de contributeurs ce mois-ci</p>
                  <p>Lancez une discussion pour apparaître ici.</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {board.rows.map((row) => (
                    <div key={row.user.documentId} className="flex items-center gap-3 border-b border-hairline py-2.5 last:border-0">
                      <span className={`w-[30px] flex-none font-extrabold tabular-nums ${row.rank <= 3 ? 'text-brand-text' : 'text-ink-3'}`}>
                        {row.rank}
                      </span>
                      <Avatar username={row.user.username} size="sm" />
                      <span className="flex min-w-0 flex-col">
                        <Link href={`/membres/${encodeURIComponent(row.user.username)}`} className="hover:text-brand-text">
                          {row.user.username}
                        </Link>
                        <span className="text-xs text-ink-3">{row.user.title ?? row.user.name}</span>
                      </span>
                      <span className="ml-auto flex-none text-right font-bold tabular-nums">
                        {period === 'all' ? row.points : row.monthPoints} pts
                        <small className="block text-[11px] font-medium text-ink-3">
                          {period === 'all' ? `ce mois : ${row.monthPoints}` : `cumul : ${row.points}`}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="flex min-w-0 flex-col gap-[18px]">
            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                Comment gagner des points
              </h2>
              <div>
                {board.rules.map(([label, pts]) => (
                  <p key={label} className="flex justify-between gap-2.5 border-b border-hairline py-1.5 text-[13.5px] text-ink-2 last:border-0">
                    <span>{label}</span>
                    <b className="font-bold text-brand-text">+{pts}</b>
                  </p>
                ))}
              </div>
            </section>
            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                Niveaux
              </h2>
              <div>
                {board.levels.map((level) => (
                  <p key={level.min} className="flex justify-between gap-2.5 border-b border-hairline py-1.5 text-[13.5px] text-ink-2 last:border-0">
                    <span>{level.name}</span>
                    <b className="font-bold text-brand-text">{level.min} pts</b>
                  </p>
                ))}
              </div>
            </section>
          </aside>
        </div>
      </div>
    </div>
  );
}
