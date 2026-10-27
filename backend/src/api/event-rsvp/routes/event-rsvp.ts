export default {
  routes: [
    {
      method: 'POST',
      path: '/event-rsvps/toggle',
      handler: 'event-rsvp.toggle',
      config: { auth: { scope: ['authenticated'] } },
    },
  ],
};
