import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

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

const STAT = 'rounded-ctl bg-surface-2 px-2 py-3 text-center';
const RULE = 'flex justify-between gap-2.5 border-b border-hairline py-1.5 text-[13.5px] text-ink-2 last:border-0';

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
      notFound(); // 404 propre si le membre n'existe pas.
    }
    throw error;
  }

  const { user, stats, badges } = profile;
  const earned = new Set(badges.earned);
  const progress =
    stats.level.next != null
      ? Math.round(((stats.points - stats.level.min) / (stats.level.next - stats.level.min)) * 100)
      : 100;

  const statsGrid: Array<[string, number]> = [
    ['points', stats.points],
    ['points du mois', stats.monthPoints],
    ['réponses', stats.counts.replies],
    ['discussions', stats.counts.topics],
    ['billets', stats.counts.blogs],
    ['meilleures réponses', stats.counts.solutions],
    ['« Utile » reçus', stats.counts.likesReceived],
    ['votes', stats.counts.votes],
    ["jours d'affilée", stats.streak],
  ];

  return (
    <div>
      <Header />
      <div className="wrap">
        <div className="grid items-start gap-7 pb-24 pt-6 min-[1100px]:grid-cols-[212px_minmax(0,1fr)]">
          <SideNav categories={categories} />

          <main className="flex min-w-0 flex-col gap-[18px]">
            <Link href="/classement" className="inline-flex w-fit items-center gap-1.5 text-[13.5px] font-medium text-ink-3 hover:text-brand-text">
              <IconArrowLeft className="icon" />
              Classement
            </Link>

            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <div className="flex flex-wrap items-center gap-4">
                <Avatar username={user.username} size="lg" />
                <div className="min-w-0">
                  <h1 className="flex flex-wrap items-center gap-2.5 font-display text-2xl font-bold">
                    {user.username}
                    {user.is_redaction && (
                      <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full bg-redac-soft px-[9px] text-[11.5px] font-semibold text-redac">
                        Rédaction
                      </span>
                    )}
                    {user.is_moderator && (
                      <span className="inline-flex h-[22px] items-center gap-[5px] whitespace-nowrap rounded-full bg-pro/10 px-[9px] text-[11.5px] font-semibold text-pro">
                        Modérateur
                      </span>
                    )}
                  </h1>
                  {user.title && <p className="text-[13px] text-ink-3">{user.title}</p>}
                  {user.bio && <p className="mt-1 max-w-[60ch] text-sm text-ink-2">{user.bio}</p>}
                  <p className="mt-1 text-[12.5px] text-ink-3">
                    Membre depuis {dateFmt.format(new Date(user.createdAt))}
                  </p>
                </div>
              </div>

              <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-fill" role="progressbar" aria-valuenow={progress}>
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[color-mix(in_srgb,#eb0f0f_75%,#fff)] to-brand"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <p className="mt-1.5 text-[12.5px] text-ink-3">
                Niveau « {stats.level.name} » · {stats.points} points
                {stats.level.next != null &&
                  ` · prochain niveau « ${stats.level.nextName} » à ${stats.level.next} pts`}
              </p>
            </section>

            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                Statistiques
              </h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(110px,1fr))] gap-2.5">
                {statsGrid.map(([label, value]) => (
                  <div key={label} className={STAT}>
                    <b className="block font-display text-[21px] font-extrabold tabular-nums">{value}</b>
                    <span className="text-[11.5px] text-ink-3">{label}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-card border border-hairline bg-surface p-[18px] shadow-card">
              <h2 className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-ink">
                Badges <span className="text-ink-3">({badges.earned.length})</span>
              </h2>
              <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-2.5">
                {badges.definitions.map((badge) => {
                  const has = earned.has(badge.code);
                  return (
                    <div key={badge.code} className={`rounded-ctl border px-3 py-2.5 ${has ? 'border-brand/30 bg-brand-soft' : 'border-hairline bg-surface'}`}>
                      <b className={`flex items-center gap-1.5 text-[13px] ${has ? 'text-brand-text' : ''}`}>
                        {badge.label}
                        {has && <IconCheck className="h-[13px] w-[13px]" />}
                      </b>
                      <span className="text-xs text-ink-3">{badge.desc}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}
