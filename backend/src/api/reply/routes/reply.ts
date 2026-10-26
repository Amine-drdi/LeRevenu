import { factories } from '@strapi/strapi';

/**
 * Voir routes/discussion.ts : protection standard U&P, normalisation 401 par
 * middleware, et sécurité finale dans le contrôleur (auteur forcé, validation).
 */
export default factories.createCoreRouter('api::reply.reply');
