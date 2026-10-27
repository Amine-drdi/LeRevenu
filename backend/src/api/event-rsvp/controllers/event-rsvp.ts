import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

export default factories.createCoreController('api::event-rsvp.event-rsvp', ({ strapi }) => ({
  /** Bascule « Je participe » à un événement. */
  async toggle(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise.');

    const { eventId } = (ctx.request.body as Record<string, any>) ?? {};
    if (!eventId) throw new ValidationError('eventId est obligatoire.');

    const event = (await strapi.db
      .query('api::event.event')
      .findOne({ where: { documentId: String(eventId) }, select: ['id'] })) as
      | { id: number }
      | null;
    if (!event) throw new ValidationError('L\'événement est introuvable.');

    const existing = (await strapi.db.query('api::event-rsvp.event-rsvp').findOne({
      where: { user: user.id, event: event.id },
    })) as { id: number } | null;

    if (existing) {
      await strapi.db.query('api::event-rsvp.event-rsvp').delete({ where: { id: existing.id } });
    } else {
      await strapi.db.query('api::event-rsvp.event-rsvp').create({
        data: { user: user.id, event: event.id },
      });
    }

    const going = (await strapi.db.query('api::event-rsvp.event-rsvp').count({
      where: { event: event.id },
    })) as number;
    return { going: !existing, participants: going };
  },
}));
