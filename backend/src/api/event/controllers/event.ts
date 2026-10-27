import { factories } from '@strapi/strapi';

export default factories.createCoreController('api::event.event', ({ strapi }) => ({
  /** Liste publique des événements à venir + compte de participants + ma participation. */
  async find(ctx) {
    const response = (await super.find(ctx)) as { data?: any[] | any; meta?: unknown };
    const events = (Array.isArray(response?.data) ? response.data : []) as Array<Record<string, any>>;
    await attachEventsMeta(strapi, events, ctx.state.user?.id);
    return response;
  },

  async findOne(ctx) {
    const response = (await super.findOne(ctx)) as { data?: any };
    if (response?.data) await attachEventsMeta(strapi, [response.data], ctx.state.user?.id);
    return response;
  },
}));

async function attachEventsMeta(strapi: any, events: Array<Record<string, any>>, userId?: number) {
  const ids = events.map((e) => e.id).filter(Boolean);
  if (!ids.length) return;
  const rsvps = (await strapi.db
    .query('api::event-rsvp.event-rsvp')
    .findMany({ where: { event: { id: { $in: ids } } }, populate: ['event'] })) as Array<{
    event: { id: number } | null;
  }>;
  for (const e of events) {
    e.participants = rsvps.filter((r) => r.event?.id === e.id).length;
  }
  if (userId != null) {
    const mine = (await strapi.db.query('api::event-rsvp.event-rsvp').findMany({
      where: { user: userId, event: { id: { $in: ids } } },
      populate: ['event'],
    })) as Array<{ event: { id: number } | null }>;
    const mineIds = new Set(mine.map((r) => r.event?.id));
    for (const e of events) e.me = mineIds.has(e.id);
  }
}
