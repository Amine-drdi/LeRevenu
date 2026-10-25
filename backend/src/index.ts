import type { Core } from '@strapi/strapi';
import { syncRolePermissions } from './bootstrap/permissions';

export default {
  /**
   * Analytic functions, static data and utilities can be added to the global
   * registry (executed before the application initializes).
   */
  register(/* { strapi }: { strapi: Core.Strapi } */) {},

  /**
   * Executed after the application initializes (routes, middlewares, hooks...).
   * Les plugins (dont users-permissions) sont déjà initialisés à ce stade :
   * on peut donc synchroniser les permissions des rôles.
   */
  async bootstrap({ strapi }: { strapi: Core.Strapi }) {
    await syncRolePermissions(strapi);
  },
};
