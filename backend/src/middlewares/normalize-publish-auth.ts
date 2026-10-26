import type { Core } from '@strapi/strapi';

/**
 * Normalisation du contrat d'API — publication.
 *
 * Les routes de publication (POST /api/discussions, POST /api/replies)
 * exigent un JWT. Strapi renvoie 403 lorsque le rôle (anonyme) n'a pas la
 * permission sur l'action ; pour ces deux routes, le contrat d'API choisi
 * est 401 Unauthorized (« authentification requise »), qui décrit mieux la
 * cause réelle du refus.
 *
 * La sécurité elle-même reste en triple exemplaire :
 * 1. policy Users & Permissions (403 si la permission manque) ;
 * 2. ce middleware de normalisation (403 → 401 pour les anonymes) ;
 * 3. le contrôleur : re-vérification de ctx.state.user, auteur FORCÉ depuis
 *    le JWT (anti-usurpation) et validation métier (400).
 */
const PUBLISH_ROUTES: RegExp[] = [/^\/api\/discussions$/, /^\/api\/replies$/];

const middleware: Core.MiddlewareFactory = () => async (ctx, next) => {
  await next();

  if (
    ctx.status === 403 &&
    ctx.method === 'POST' &&
    !ctx.state.user &&
    PUBLISH_ROUTES.some((pattern) => pattern.test(ctx.path))
  ) {
    ctx.status = 401;
    ctx.body = {
      data: null,
      error: {
        status: 401,
        name: 'UnauthorizedError',
        message: 'Authentification requise pour publier.',
        details: {},
      },
    };
  }
};

export default middleware;
