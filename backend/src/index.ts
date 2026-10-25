import type { Core } from '@strapi/strapi';

export default {
  /**
   * Analytic functions, static data and utilities can be added to the global
   * registry (executed before the application initializes).
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Executed after the application initializes (routes, middlewares, hooks...).
   */
  bootstrap(/* { strapi }: { strapi: Core.Strapi } */) {},
};
