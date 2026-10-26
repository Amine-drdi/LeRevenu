import { factories } from '@strapi/strapi';

/**
 * Routes standards du content-type. La création reste protégée par la policy
 * Users & Permissions (permission `create` accordée au rôle Authenticated
 * uniquement, configurée dans src/bootstrap/permissions.ts) ; le refus
 * anonyme (403) est normalisé en 401 par le middleware
 * `global::normalize-publish-auth`, et le contrôleur applique la politique
 * finale : re-vérification du JWT, auteur FORCÉ depuis ctx.state.user
 * (anti-usurpation) et validation métier (titre >= 10 caractères, etc.).
 */
export default factories.createCoreRouter('api::discussion.discussion');
