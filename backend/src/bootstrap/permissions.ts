import type { Core } from '@strapi/strapi';

/**
 * Synchronisation des permissions Users & Permissions au démarrage.
 *
 * Pourquoi en code et pas uniquement « à la main » dans l'admin ?
 * - reproductible sur n'importe quel environnement (dev, test, démo) ;
 * - idempotent : n'ajoute jamais deux fois la même permission et ne
 *   révoque AUCUNE permission existante (union, pas remplacement) ;
 * - le refus par défaut : tout ce qui n'est pas listé ici reste interdit.
 *
 * Rappel du modèle de sécurité du forum :
 * - Public     : lecture seule (find / findOne sur les 3 content-types) ;
 * - Authentifié: lecture + création de discussions et de réponses
 *                (le JWT est exigé — la vérification 401/anti-usurpation
 *                vit en plus dans les contrôleurs, étape 3).
 */
const PUBLIC_ACTIONS: string[] = [
  'api::category.category.find',
  'api::category.category.findOne',
  'api::discussion.discussion.find',
  'api::discussion.discussion.findOne',
  'api::reply.reply.find',
  'api::reply.reply.findOne',
];

const AUTHENTICATED_EXTRA_ACTIONS: string[] = [
  'api::discussion.discussion.create',
  'api::reply.reply.create',
];

async function grant(strapi: Core.Strapi, roleType: string, actions: string[]): Promise<void> {
  const role = (await strapi.db
    .query('plugin::users-permissions.role')
    .findOne({ where: { type: roleType } })) as { id: number } | null;

  if (!role) {
    strapi.log.warn(`[permissions] rôle "${roleType}" introuvable, étape ignorée`);
    return;
  }

  const existing = (await strapi.db
    .query('plugin::users-permissions.permission')
    .findMany({ where: { role: role.id } })) as Array<{ action: string }>;

  const existingActions = new Set(existing.map((p) => p.action));
  const missing = actions.filter((action) => !existingActions.has(action));

  if (missing.length === 0) return;

  await Promise.all(
    missing.map((action) =>
      strapi.db.query('plugin::users-permissions.permission').create({
        data: { action, role: role.id },
      })
    )
  );

  strapi.log.info(
    `[permissions] rôle "${roleType}" : ${missing.length} permission(s) ajoutée(s) : ${missing.join(', ')}`
  );
}

export async function syncRolePermissions(strapi: Core.Strapi): Promise<void> {
  try {
    await grant(strapi, 'public', PUBLIC_ACTIONS);
    await grant(strapi, 'authenticated', [
      ...PUBLIC_ACTIONS,
      ...AUTHENTICATED_EXTRA_ACTIONS,
    ]);
  } catch (error) {
    // Ne jamais empêcher le démarrage de l'API sur une erreur de permissions.
    strapi.log.error('[permissions] synchronisation impossible :', error);
  }
}
