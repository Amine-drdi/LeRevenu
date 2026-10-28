import type { Metadata } from 'next';
import Link from 'next/link';

import Avatar from '@/components/Avatar';
import Header from '@/components/Header';
import { IconArrowLeft, IconCheck } from '@/components/icons';
import SideNav from '@/components/SideNav';
import { ApiRequestError, getCategories, getMember } from '@/lib/api';

/**
 * Profil public d'un membre (Server Component) — /membres/[username].
 * Statistiques calculées côté API depuis l'activité réelle (jamais stockées
 * côté client) : points, niveau, série de contribution, badges gagnés.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  return { title: `${username} — Le Revenu` };
}

const dateFmt = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' });

export default async function MembrePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;
  let profile;
  let categories;
  try {
    [profile, categories] = await Promise.all([getMember(username), getCategories()]);
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 404) {
      // 404 propre si le membre n'existe pas.
      const { notFound } = await import('next/navigation');
      notFound();
    }
    throw error;
  }

  const { user, stats, badges, levels } = profile;
  const earned = new Set(badges.earned);
  const progress =
    stats.level.next != null
      ? Math.round(((stats.points - stats.level.min) / (stats.level.next - stats.level.min)) * 100)
      : 100;

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="layout no-right">
          <SideNav categories={categories} />

          <main className="main">
            <Link href="/classement" className="back">
              <IconArrowLeft className="icon" />
              Classement
            </Link>

            <section className="card">
              <div className="profile-head">
                <Avatar username={user.username} size="lg" />
                <div className="profile-id">
                  <h1 className="profile-name">
                    {user.username}
                    {user.is_redaction && <span className="chip chip-redac">Rédaction</span>}
                    {user.is_moderator && <span className="chip chip-p">Modérateur</span>}
                  </h1>
                  {user.title && <p className="muted" style={{ fontSize: 13 }}>{user.title}</p>}
                  {user.bio && <p className="profile-bio">{user.bio}</p>}
                  <p className="muted" style={{ fontSize: 12.5, marginTop: 4 }}>
                    Membre depuis {dateFmt.format(new Date(user.createdAt))}
                  </p>
                </div>
              </div>

              <div className="lvl-bar" role="progressbar" aria-valuenow={progress}>
                <div className="lvl-fill" style={{ width: `${Math.min(progress, 100)}%` }} />
              </div>
              <p className="muted" style={{ fontSize: 12.5, marginTop: 6 }}>
                Niveau « {stats.level.name} » · {stats.points} points
                {stats.level.next != null &&
                  ` · prochain niveau « ${stats.level.nextName} » à ${stats.level.next} pts`}
              </p>
            </section>

            <section className="card">
              <h2 className="card-title">Statistiques</h2>
              <div className="stat-grid">
                <div className="stat"><b>{stats.points}</b><span>points</span></div>
                <div className="stat"><b>{stats.monthPoints}</b><span>points du mois</span></div>
                <div className="stat"><b>{stats.counts.replies}</b><span>réponses</span></div>
                <div className="stat"><b>{stats.counts.topics}</b><span>discussions</span></div>
                <div className="stat"><b>{stats.counts.blogs}</b><span>billets</span></div>
                <div className="stat"><b>{stats.counts.solutions}</b><span>meilleures réponses</span></div>
                <div className="stat"><b>{stats.counts.likesReceived}</b><span>« Utile » reçus</span></div>
                <div className="stat"><b>{stats.counts.votes}</b><span>votes</span></div>
                <div className="stat"><b>{stats.streak}</b><span>jours d'affilée</span></div>
              </div>
            </section>

            <section className="card">
              <h2 className="card-title">
                Badges <span className="muted">({badges.earned.length})</span>
              </h2>
              <div className="badge-grid">
                {badges.definitions.map((badge) => (
                  <div key={badge.code} className={`bdg ${earned.has(badge.code) ? 'on' : ''}`}>
                    <b>
                      {badge.label}
                      {earned.has(badge.code) && (
                        <IconCheck className="icon" style={{ width: 13, height: 13, display: 'inline', marginLeft: 5 }} />
                      )}
                    </b>
                    <span>{badge.desc}</span>
                  </div>
                ))}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
