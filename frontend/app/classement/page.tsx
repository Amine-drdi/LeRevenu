import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import SideNav from '@/components/SideNav';
import { getCategories, getLeaderboard } from '@/lib/api';

export const metadata = { title: 'Classement des membres — Le Revenu' };
/** Données vivantes : rendu à la demande (pas de pré-rendu au build). */
export const dynamic = 'force-dynamic';

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
        <div className="layout">
          <SideNav categories={categories} activeSection="classement" />

          <main className="main">
            <div className="page-head">
              <div>
                <h1 className="page-title">Classement</h1>
                <p className="page-sub">
                  Les points se gagnent en contribuant : réponses, discussions,
                  billets, « Utile » reçus, meilleures réponses, votes.
                </p>
              </div>
              <div className="seg" style={{ width: 220 }}>
                <Link
                  href="/classement"
                  className={period === 'month' ? 'on' : ''}
                  style={{ display: 'grid', placeItems: 'center' }}
                >
                  Ce mois-ci
                </Link>
                <Link
                  href="/classement?period=all"
                  className={period === 'all' ? 'on' : ''}
                  style={{ display: 'grid', placeItems: 'center' }}
                >
                  Général
                </Link>
              </div>
            </div>

            <section className="card">
              {board.rows.length === 0 ? (
                <div className="empty">
                  <p className="t">Pas encore de contributeurs ce mois-ci</p>
                  <p>Lancez une discussion pour apparaître ici.</p>
                </div>
              ) : (
                <div className="board">
                  {board.rows.map((row) => (
                    <div key={row.user.documentId} className="board-row">
                      <span className={`rank ${row.rank <= 3 ? 'top' : ''}`}>{row.rank}</span>
                      <Avatar username={row.user.username} size="sm" />
                      <span className="board-who">
                        <Link href={`/membres/${encodeURIComponent(row.user.username)}`}>
                          {row.user.username}
                        </Link>
                        <span className="muted">{row.user.title ?? row.user.name}</span>
                      </span>
                      <span className="pts">
                        {period === 'all' ? row.points : row.monthPoints} pts
                        <small>
                          {period === 'all' ? `ce mois : ${row.monthPoints}` : `cumul : ${row.points}`}
                        </small>
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </main>

          <aside className="right">
            <section className="card">
              <h2 className="card-title">Comment gagner des points</h2>
              <div>
                {board.rules.map(([label, pts]) => (
                  <p key={label} className="rule-row">
                    <span>{label}</span>
                    <b>+{pts}</b>
                  </p>
                ))}
              </div>
            </section>
            <section className="card">
              <h2 className="card-title">Niveaux</h2>
              <div className="board">
                {board.levels.map((level) => (
                  <p key={level.min} className="rule-row">
                    <span>{level.name}</span>
                    <b>{level.min} pts</b>
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
