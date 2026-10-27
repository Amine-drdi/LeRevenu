import { factories } from '@strapi/strapi';

const shape = (n: Record<string, any>) => ({
  documentId: n.documentId ?? n.document_id,
  type: n.type,
  message: n.message,
  read: !!n.read,
  createdAt: n.createdAt,
  actor: n.actor
    ? { documentId: n.actor.documentId ?? n.actor.document_id, username: n.actor.username }
    : null,
  discussion: n.discussion
    ? { documentId: n.discussion.documentId ?? n.discussion.document_id, slug: n.discussion.slug }
    : null,
});

export default factories.createCoreController('api::notification.notification', ({ strapi }) => ({
  /**
   * Notifications du membre connecté UNIQUEMENT (anti-usurpation : le filtre
   * utilise ctx.state.user, jamais un paramètre client). Aucune route create
   * n'est exposée : les notifications sont écrites par les contrôleurs.
   */
  async find(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');
    const rows = (await strapi.db.query('api::notification.notification').findMany({
      where: { user: user.id },
      orderBy: { createdAt: 'desc' },
      limit: 50,
      populate: ['actor', 'discussion'],
    })) as Array<Record<string, any>>;
    return { data: rows.map(shape) };
  },

  async unreadCount(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');
    const count = (await strapi.db.query('api::notification.notification').count({
      where: { user: user.id, read: false },
    })) as number;
    return { count };
  },

  async markRead(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');
    const { id } = ctx.params;
    await strapi.db.query('api::notification.notification').updateMany({
      where: { user: user.id, documentId: String(id) },
      data: { read: true },
    });
    return { ok: true };
  },

  async markAllRead(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');
    await strapi.db.query('api::notification.notification').updateMany({
      where: { user: user.id, read: false },
      data: { read: true },
    });
    return { ok: true };
  },
}));
