/**
 * Routes custom de l'API discussion (le CRUD standard vit dans
 * routes/discussion.ts). Fichier séparé : le spreading du routeur core
 * exécuterait son getter `routes` au chargement du module, avant
 * l'initialisation des content-types.
 */
export default {
  routes: [
    {
      method: 'POST',
      path: '/discussions/:id/solution',
      handler: 'discussion.solution',
      config: { auth: { scope: ['authenticated'] } },
    },
  ],
};
