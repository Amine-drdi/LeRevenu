/**
 * Voir controllers/like.ts : protection U&P + normalisation 401 par
 * middleware, sécurité finale dans le contrôleur (anti-usurpation).
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/likes/toggle',
      handler: 'like.toggle',
      config: { auth: { scope: ['authenticated'] } },
    },
  ],
};
