/**
 * Logique métier partagée de la communauté : représentation publique des
 * membres, notifications, points / niveaux / badges.
 *
 * Règles de points (affichées telles quelles dans le classement) :
 *   réponse +3 · discussion +5 · billet +5 · « Utile » reçu +5
 *   meilleure réponse +20 · vote +1
 */
import type { Core } from '@strapi/strapi';

export const LEVELS: Array<[number, string]> = [
  [0, 'Nouveau venu'],
  [25, 'Membre'],
  [100, 'Contributeur'],
  [300, 'Contributeur averti'],
  [750, 'Pilier de la communauté'],
];

export const BADGES: Record<string, [string, string]> = {
  bienvenue: ['Bienvenue', 'A rejoint la communauté'],
  premier_sujet: ['Premier pas', 'A lancé sa première discussion'],
  premiere_reponse: ['Entraide', 'A publié sa première réponse'],
  apprecie: ['Apprécié', 'A reçu son premier « Utile »'],
  populaire: ['Populaire', 'A reçu 25 « Utile »'],
  solution: ['Bonne réponse', 'Réponse choisie comme meilleure réponse'],
  sondeur: ['Sondeur', 'A lancé un sondage'],
  citoyen: ['Votre avis compte', 'A voté à 3 sondages'],
  assidu: ['Assidu', '7 jours de contribution d’affilée'],
  pilier: ['Pilier des échanges', 'A publié 50 réponses'],
};

/** Représentation publique et minimale d'un membre (jamais de champ privé). */
export const toAuthor = (
  user: Record<string, any> | null | undefined
): { documentId: string; username: string; title?: string | null; bio?: string | null; is_redaction?: boolean; photo?: string | null } | null =>
  user
    ? {
        documentId: user.documentId ?? user.document_id ?? '',
        username: user.username ?? 'anonyme',
        title: user.title ?? null,
        bio: user.bio ?? null,
        is_redaction: !!user.is_redaction,
        photo: user.photo?.url ?? null,
      }
    : null;

export function levelOf(points: number) {
  let i = 0;
  LEVELS.forEach((l, k) => {
    if (points >= l[0]) i = k;
  });
  const next = LEVELS[i + 1] ?? null;
  return {
    index: i,
    name: LEVELS[i][1],
    min: LEVELS[i][0],
    next: next ? next[0] : null,
    nextName: next ? next[1] : null,
  };
}

/** Crée une notification (usage interne uniquement — aucune route create). */
export async function notify(
  strapi: Core.Strapi,
  input: {
    user: { id: number; documentId?: string };
    actor?: { id: number } | null;
    type: 'reply' | 'like' | 'mention' | 'badge' | 'level';
    message: string;
    discussion?: { id: number } | null;
  }
): Promise<void> {
  if (input.actor && input.actor.id === input.user.id) return; // jamais de notification à soi-même
  try {
    await strapi.db.query('api::notification.notification').create({
      data: {
        user: input.user.id,
        actor: input.actor?.id ?? null,
        type: input.type,
        message: input.message.slice(0, 200),
        discussion: input.discussion?.id ?? null,
        read: false,
      },
    });
  } catch (error) {
    strapi.log.warn('[notification] création impossible :', error);
  }
}

/** Notifie les @mentions d'un texte (usernames existants, sans soi-même). */
export async function notifyMentions(
  strapi: Core.Strapi,
  body: string,
  actor: { id: number; username?: string },
  discussion: { id: number } | null
): Promise<void> {
  const names = [...new Set([...body.matchAll(/@([A-Za-z0-9_.\-]+)/g)].map((m) => m[1]))];
  if (!names.length) return;
  const users = (await strapi.db
    .query('plugin::users-permissions.user')
    .findMany({ where: { username: { $in: names } } })) as Array<{ id: number; username: string }>;
  for (const u of users) {
    await notify(strapi, { user: u, actor, type: 'mention', message: `${actor.username ?? 'Un membre'} vous a mentionné`, discussion });
  }
}

interface CountRow {
  id: number;
  n: number;
}

/**
 * Statistiques complètes d'un membre, calculées depuis son activité réelle.
 * Les points ne sont pas stockés : impossible de se les attribuer.
 */
export async function computeMemberStats(strapi: Core.Strapi, user: Record<string, any>) {
  const uid = user.id;
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const replies = (await strapi.db.query('api::reply.reply').count({ where: { author: uid } })) as number;
  const monthReplies = (await strapi.db.query('api::reply.reply').count({
    where: { author: uid, createdAt: { $gte: monthStart } },
  })) as number;
  const topics = (await strapi.db.query('api::discussion.discussion').count({ where: { author: uid } })) as number;
  const monthTopics = (await strapi.db.query('api::discussion.discussion').count({
    where: { author: uid, createdAt: { $gte: monthStart } },
  })) as number;
  const blogs = (await strapi.db.query('api::blog-post.blog-post').count({ where: { author: uid } })) as number;
  const monthBlogs = (await strapi.db.query('api::blog-post.blog-post').count({
    where: { author: uid, createdAt: { $gte: monthStart } },
  })) as number;
  const votes = (await strapi.db.query('api::poll-vote.poll-vote').count({ where: { user: uid } })) as number;

  // « Utile » reçus : likes dont la cible appartient au membre.
  const myReplies = (await strapi.db.query('api::reply.reply').findMany({
    where: { author: uid },
    select: ['id'],
  })) as Array<{ id: number }>;
  const myBlogs = (await strapi.db.query('api::blog-post.blog-post').findMany({
    where: { author: uid },
    select: ['id'],
  })) as Array<{ id: number }>;
  const likesWhere: any = {
    $or: [
      { discussion: { author: uid } },
      { blog_post: { author: uid } },
      ...(myReplies.length ? [{ reply: { id: { $in: myReplies.map((r) => r.id) } } }] : []),
      ...(myBlogs.length ? [{ blog_post: { id: { $in: myBlogs.map((b) => b.id) } } }] : []),
    ],
  };
  const likesReceived = (await strapi.db.query('api::like.like').count({ where: likesWhere })) as number;
  const monthLikesReceived = (await strapi.db.query('api::like.like').count({
    where: { ...likesWhere, createdAt: { $gte: monthStart } },
  })) as number;

  // Meilleures réponses : discussions dont la solution est une réponse du membre.
  const solutionRows = (await strapi.db.query('api::discussion.discussion').findMany({
    where: { solution: { author: uid } },
    select: ['id'],
  })) as Array<{ id: number }>;
  const solutions = solutionRows.length;

  const points = replies * 3 + topics * 5 + blogs * 5 + likesReceived * 5 + solutions * 20 + votes * 1;
  const monthPoints = monthReplies * 3 + monthTopics * 5 + monthBlogs * 5 + monthLikesReceived * 5;

  // Série de jours de contribution (toute activité compte).
  const dayRows: Array<{ d: string }> = [];
  const activitySources: Array<{ table: string; column: string }> = [
    { table: 'api::reply.reply', column: 'author' },
    { table: 'api::discussion.discussion', column: 'author' },
    { table: 'api::blog-post.blog-post', column: 'author' },
    { table: 'api::poll-vote.poll-vote', column: 'user' },
  ];
  for (const src of activitySources) {
    const rows = (await strapi.db.query(src.table).findMany({
      where: { [src.column]: uid, createdAt: { $gte: new Date(Date.now() - 30 * 864e5) } },
      select: ['createdAt'],
    })) as Array<{ createdAt: string | Date }>;
    rows.forEach((r) => dayRows.push({ d: new Date(r.createdAt).toISOString().slice(0, 10) }));
  }
  const days = new Set(dayRows.map((r) => r.d));
  let streak = 0;
  const cursor = new Date();
  for (;;) {
    const key = cursor.toISOString().slice(0, 10);
    if (days.has(key)) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else if (key === new Date().toISOString().slice(0, 10)) {
      cursor.setDate(cursor.getDate() - 1); // aujourd'hui sans activité : la série tient encore hier
    } else break;
    if (streak > 30) break;
  }

  return {
    points,
    monthPoints,
    counts: { replies, topics, blogs, votes, likesReceived, solutions },
    level: levelOf(points),
    streak,
  };
}

/** Badges gagnés d'après les statistiques (calcul pur, sans effet de bord). */
export function computeBadges(stats: Awaited<ReturnType<typeof computeMemberStats>>): string[] {
  const c = stats.counts;
  const won: string[] = ['bienvenue'];
  if (c.topics >= 1) won.push('premier_sujet');
  if (c.replies >= 1) won.push('premiere_reponse');
  if (c.likesReceived >= 1) won.push('apprecie');
  if (c.likesReceived >= 25) won.push('populaire');
  if (c.solutions >= 1) won.push('solution');
  if (c.votes >= 3) won.push('citoyen');
  if (c.replies >= 50) won.push('pilier');
  if (stats.streak >= 7) won.push('assidu');
  return won;
}
