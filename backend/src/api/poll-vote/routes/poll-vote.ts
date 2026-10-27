export default {
  routes: [
    {
      method: 'POST',
      path: '/poll-votes/cast',
      handler: 'poll-vote.cast',
      config: { auth: { scope: ['authenticated'] } },
    },
  ],
};
