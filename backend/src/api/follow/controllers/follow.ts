import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController('api::follow.follow', ({ strapi }) => ({
  /** Bascule le suivi d'une discussion (notifications à chaque nouvelle réponse). */
  async toggle(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');

    const { discussionId } = (ctx.request.body as Record<string, any>) ?? {};
    if (!discussionId) throw new ValidationError('discussionId est obligatoire.');

    const discussion = (await strapi.db
      .query('api::discussion.discussion')
      .findOne({ where: { documentId: String(discussionId) }, select: ['id'] })) as
      | { id: number }
      | null;
    if (!discussion) throw new ValidationError('La discussion est introuvable.');

    const existing = (await strapi.db.query('api::follow.follow').findOne({
      where: { user: user.id, discussion: discussion.id },
    })) as { id: number } | null;

    if (existing) {
      await strapi.db.query('api::follow.follow').delete({ where: { id: existing.id } });
    } else {
      await strapi.db.query('api::follow.follow').create({
        data: { user: user.id, discussion: discussion.id },
      });
    }

    const follows = (await strapi.db.query('api::follow.follow').count({
      where: { discussion: discussion.id },
    })) as number;
    return { following: !existing, follows };
  },
}));
