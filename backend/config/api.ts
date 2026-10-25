import type { Core } from '@strapi/strapi';

export default ({ env }: Core.Config.Shared.ConfigParams): Core.Config.API => ({
  rest: {
    defaultLimit: 25,
    maxLimit: 100,
    withCount: true,
  },
});
