/**
 * Routes custom du suivi de discussions (le reste du CRUD n'est pas exposé).
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/follows/toggle',
      handler: 'follow.toggle',
      config: { auth: { scope: ['authenticated'] } },
    },
  ],
};
