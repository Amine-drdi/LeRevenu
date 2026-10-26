/**
 * Utilitaires de slug pour les URLs propres des discussions.
 */
export const slugify = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'discussion';

/**
 * Suffixe aléatoire (8 caractères base36) garantissant l'unicité pratique du
 * slug sans avoir à dépendre d'un compteur de base de données.
 */
export const randomSuffix = (): string => Math.random().toString(36).slice(2, 10);
