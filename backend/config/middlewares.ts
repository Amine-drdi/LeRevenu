export default [
  'strapi::logger',
  'strapi::errors',
  'strapi::security',
  'strapi::cors',
  'strapi::poweredBy',
  'strapi::query',
  'strapi::body',
  'strapi::session',
  'strapi::favicon',
  'strapi::public',
  // Normalise 403 → 401 sur les routes de publication (voir le fichier
  // src/middlewares/normalize-publish-auth.ts).
  'global::normalize-publish-auth',
];
