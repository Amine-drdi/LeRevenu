import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController('api::poll-vote.poll-vote', ({ strapi }) => ({
  /**
   * Vote (ou changement de vote) sur un sondage : une voix par membre,
   * l'index d'option doit exister dans poll_options figé à la création.
   */
  async cast(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');

    const { discussionId, option } = (ctx.request.body as Record<string, any>) ?? {};
    if (discussionId == null || option == null) {
      throw new ValidationError('discussionId et option sont obligatoires.');
    }
    const index = Number(option);
    if (!Number.isInteger(index) || index < 0) throw new ValidationError('Option invalide.');

    const discussion = (await strapi.db
      .query('api::discussion.discussion')
      .findOne({ where: { documentId: String(discussionId) } })) as
      | { id: number; type: string; poll_options: Array<{ label: string }> | null }
      | null;
    if (!discussion || discussion.type !== 'poll') {
      throw new ValidationError('Le sondage est introuvable.');
    }
    const options = Array.isArray(discussion.poll_options) ? discussion.poll_options : [];
    if (index >= options.length) throw new ValidationError('Cette option n\'existe pas.');

    const existing = (await strapi.db.query('api::poll-vote.poll-vote').findOne({
      where: { user: user.id, discussion: discussion.id },
    })) as { id: number } | null;

    if (existing) {
      await strapi.db.query('api::poll-vote.poll-vote').update({
        where: { id: existing.id },
        data: { option: index },
      });
    } else {
      await strapi.db.query('api::poll-vote.poll-vote').create({
        data: { user: user.id, discussion: discussion.id, option: index },
      });
    }

    const votes = (await strapi.db.query('api::poll-vote.poll-vote').findMany({
      where: { discussion: discussion.id },
      select: ['option'],
    })) as Array<{ option: number }>;
    const tally = options.map((_, i) => votes.filter((v) => v.option === i).length);
    return { myVote: index, tally, total: votes.length };
  },
}));
