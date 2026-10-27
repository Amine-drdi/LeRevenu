export default {
  routes: [
    { method: 'GET', path: '/members/:username', handler: 'member.get' },
    { method: 'GET', path: '/leaderboard', handler: 'member.leaderboard' },
    { method: 'POST', path: '/members/me/sync', handler: 'member.sync', config: { auth: { scope: ['authenticated'] } } },
    { method: 'PUT', path: '/members/me', handler: 'member.updateMe', config: { auth: { scope: ['authenticated'] } } },
  ],
};
