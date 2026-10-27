import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { notify } from '../../../utils/community';

const { ValidationError } = errors;

/** Résout un documentId en ligne (id numérique requis pour les jointures db.query). */
async function resolveId(strapi: any, uid: string, documentId: string) {
  const row = (await strapi.db.query(uid).findOne({
    where: { documentId: String(documentId) },
    select: ['id'],
  })) as { id: number } | null;
  return row?.id ?? null;
}

export default factories.createCoreController('api::like.like', ({ strapi }) => ({
  /**
   * Bascule un « Utile » sur une cible (discussion, réponse ou billet).
   * Une seule marque par membre et par cible ; l'auteur de la cible est
   * notifié (jamais pour ses propres messages — voir notify()).
   */
  async toggle(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');

    const { targetType, targetId } = (ctx.request.body as Record<string, any>) ?? {};
    const targets: Record<string, string> = {
      discussion: 'api::discussion.discussion',
      reply: 'api::reply.reply',
      'blog-post': 'api::blog-post.blog-post',
    };
    const uid = targets[String(targetType)];
    if (!uid || !targetId) throw new ValidationError('Cible invalide (targetType, targetId).');

    const targetRow = (await strapi.db.query(uid).findOne({
      where: { documentId: String(targetId) },
      populate: ['author'],
    })) as { id: number; author: { id: number } | null } | null;
    if (!targetRow) throw new ValidationError('La cible est introuvable.');

    const relField = targetType === 'blog-post' ? 'blog_post' : String(targetType);
    const existing = (await strapi.db.query('api::like.like').findOne({
      where: { user: user.id, [relField]: targetRow.id },
    })) as { id: number } | null;

    if (existing) {
      await strapi.db.query('api::like.like').delete({ where: { id: existing.id } });
    } else {
      await strapi.db.query('api::like.like').create({
        data: { user: user.id, [relField]: targetRow.id },
      });
      if (targetRow.author) {
        await notify(strapi, {
          user: targetRow.author,
          actor: user,
          type: 'like',
          message: 'a trouvé votre contribution utile',
          discussion: targetType === 'discussion' ? { id: targetRow.id } : null,
        });
      }
    }

    const likes = (await strapi.db.query('api::like.like').count({
      where: { [relField]: targetRow.id },
    })) as number;
    return { liked: !existing, likes };
  },
}));

export { resolveId };
