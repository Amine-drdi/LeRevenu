import { errors } from '@strapi/utils';
import {
  BADGES,
  computeBadges,
  computeMemberStats,
  LEVELS,
  notify,
} from '../../../utils/community';

const { ValidationError, NotFoundError } = errors;

const publicUser = (u: Record<string, any>) => ({
  documentId: u.documentId ?? u.document_id,
  username: u.username,
  name: u.username,
  bio: u.bio ?? null,
  title: u.title ?? null,
  is_redaction: !!u.is_redaction,
  is_moderator: !!u.is_moderator,
  photo: u.photo?.url ?? null,
  createdAt: u.createdAt,
  interests: Array.isArray(u.interests) ? u.interests : [],
});

/**
 * API membre : statistiques publiques, classement, synchronisation des
 * badges/niveaux et mise à jour du profil (onboarding). Sans content-type
 * dédié — les données vivent sur le CT User et l'activité réelle.
 */
export default {
  /** Profil public d'un membre : identité + statistiques calculées + badges. */
  async get(ctx: any) {
    const { username } = ctx.params;
    const user = (await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { username: String(username) }, populate: ['photo'] })) as
      | Record<string, any>
      | null;
    if (!user) throw new NotFoundError('Membre introuvable.');

    const stats = await computeMemberStats(strapi, user);
    const earned = new Set(Array.isArray(user.badges) ? (user.badges as string[]) : []);
    return {
      data: {
        user: publicUser(user),
        stats,
        badges: {
          earned: [...earned],
          definitions: Object.entries(BADGES).map(([code, [label, desc]]) => ({ code, label, desc })),
        },
        levels: LEVELS.map(([min, name]) => ({ min, name })),
      },
    };
  },

  /** Classement : points du mois ou cumul, calculés depuis l'activité réelle. */
  async leaderboard(ctx: any) {
    const period = ctx.query.period === 'all' ? 'all' : 'month';
    const users = (await strapi.db
      .query('plugin::users-permissions.user')
      .findMany({ where: { blocked: false }, populate: ['photo'] })) as Array<Record<string, any>>;

    const rows = [] as Array<{ user: ReturnType<typeof publicUser>; points: number; monthPoints: number }>;
    for (const u of users) {
      const stats = await computeMemberStats(strapi, u);
      rows.push({ user: publicUser(u), points: stats.points, monthPoints: stats.monthPoints });
    }
    rows.sort((a, b) => (period === 'all' ? b.points - a.points : b.monthPoints - a.monthPoints));

    return {
      data: {
        period,
        rows: rows.slice(0, 50).map((r, i) => ({ rank: i + 1, ...r })),
        rules: [
          ['Publier une réponse', 3],
          ['Lancer une discussion', 5],
          ['Publier un billet de blog', 5],
          ['Recevoir un « Utile »', 5],
          ['Meilleure réponse', 20],
          ['Voter à un sondage', 1],
        ],
        levels: LEVELS.map(([min, name]) => ({ min, name })),
        badges: Object.entries(BADGES).map(([code, [label, desc]]) => ({ code, label, desc })),
      },
    };
  },

  /**
   * Synchronise le membre connecté : recalcule points/niveau/badges depuis
   * son activité, persiste les NOUVEAUX badges et notifications de niveau.
   * C'est le seul endroit où badges/level sont écrits — jamais par le client.
   */
  async sync(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');

    const full = (await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { id: user.id }, populate: ['photo'] })) as Record<string, any>;

    const stats = await computeMemberStats(strapi, full);
    const won = computeBadges(stats);

    const earned = new Set(Array.isArray(full.badges) ? (full.badges as string[]) : []);
    const fresh = won.filter((b) => !earned.has(b));
    if (fresh.length) {
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: full.id },
        data: { badges: [...earned, ...fresh] },
      });
      for (const code of fresh) {
        const def = BADGES[code];
        await notify(strapi, { user: { id: full.id }, type: 'badge', message: `Nouveau badge : ${def?.[0] ?? code}` });
      }
    }

    let levelUp: string | null = null;
    if (stats.level.index > (full.level ?? 0)) {
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: full.id },
        data: { level: stats.level.index },
      });
      levelUp = stats.level.name;
      await notify(strapi, {
        user: { id: full.id },
        type: 'level',
        message: `Vous passez au niveau « ${stats.level.name} »`,
      });
    }

    return {
      data: {
        user: publicUser(full),
        stats,
        freshBadges: fresh,
        levelUp,
        badges: {
          earned: won,
          definitions: Object.entries(BADGES).map(([code, [label, desc]]) => ({ code, label, desc })),
        },
      },
    };
  },

  /** Mise à jour du profil (onboarding / édition) : pseudo, bio, intérêts. */
  async updateMe(ctx: any) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');

    const body = (ctx.request.body as Record<string, any>) ?? {};
    const data: Record<string, any> = {};

    if (body.bio !== undefined) {
      data.bio = String(body.bio).trim().slice(0, 300);
    }
    if (body.interests !== undefined) {
      if (!Array.isArray(body.interests)) throw new ValidationError('interests doit être un tableau.');
      const valid = (await strapi.documents('api::category.category').findMany()).map(
        (c: any) => c.slug
      );
      data.interests = body.interests.filter((s: unknown) => valid.includes(s)).slice(0, 12);
    }
    if (body.name !== undefined) {
      const name = String(body.name).trim().replace(/\s+/g, ' ');
      if (name.length < 3 || name.length > 24) {
        throw new ValidationError('Le pseudo doit contenir entre 3 et 24 caractères.');
      }
      data.username = name;
    }

    if (Object.keys(data).length) {
      await strapi.db.query('plugin::users-permissions.user').update({
        where: { id: user.id },
        data,
      });
    }

    const fresh = (await strapi.db
      .query('plugin::users-permissions.user')
      .findOne({ where: { id: user.id }, populate: ['photo'] })) as Record<string, any>;
    return { data: publicUser(fresh) };
  },
};
