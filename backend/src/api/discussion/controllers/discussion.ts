import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { randomSuffix, slugify } from '../../../utils/slug';

const { ValidationError } = errors;

const MIN_TITLE_LENGTH = 10;
const ALLOWED_TYPES: readonly string[] = ['question', 'discussion'];

/** Représentation publique et minimale d'un auteur (jamais de champ privé). */
type AuthorRef = { documentId: string; username: string } | null;

const toAuthor = (user: Record<string, any> | null | undefined): AuthorRef =>
  user
    ? { documentId: user.documentId ?? user.document_id ?? '', username: user.username ?? 'anonyme' }
    : null;

export default factories.createCoreController('api::discussion.discussion', ({ strapi }) => {
  /**
   * Sécurité (point critique du test) — la policy Users & Permissions
   * reste la première ligne (403 → normalisé 401 par le middleware
   * global::normalize-publish-auth), ce contrôleur est la ligne finale :
   * 1. JWT obligatoire → 401 explicite si absent/invalide ;
   * 2. anti-usurpation : l'auteur est FORCÉ depuis ctx.state.user (utilisateur
   *    décodé du JWT). Toute valeur `author` envoyée dans le body est ignorée ;
   * 3. validation métier côté serveur : titre >= 10 caractères, contenu requis,
   *    type enum, catégorie existante → 400 sinon.
   */
  async function createDiscussion(this: any, ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentification requise pour créer une discussion.');
    }

    // Whitelist stricte : tout champ hors liste est ignoré (notamment `author`).
    const body = (ctx.request.body as { data?: Record<string, unknown> } | undefined)?.data ?? {};
    const { title: rawTitle, content: rawContent, type, category } = body;

    const title = typeof rawTitle === 'string' ? rawTitle.trim() : '';
    if (title.length < MIN_TITLE_LENGTH) {
      throw new ValidationError(
        `Le titre doit contenir au moins ${MIN_TITLE_LENGTH} caractères (reçu : ${title.length}).`
      );
    }

    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (content.length === 0) {
      throw new ValidationError('Le contenu est obligatoire.');
    }

    const discussionType = typeof type === 'string' ? type : '';
    if (!ALLOWED_TYPES.includes(discussionType)) {
      throw new ValidationError('Le type doit être "question" ou "discussion".');
    }

    if (!category) {
      throw new ValidationError('La catégorie est obligatoire.');
    }
    const categoryDoc = await strapi
      .documents('api::category.category')
      .findOne({ documentId: String(category) });
    if (!categoryDoc) {
      throw new ValidationError('La catégorie sélectionnée est invalide.');
    }

    // Slug URL propre, unique (suffixe aléatoire + contrôle d'existence).
    const slugBase = slugify(title);
    let slug = `${slugBase}-${randomSuffix()}`;
    const slugTaken = await strapi.db
      .query('api::discussion.discussion')
      .findOne({ where: { slug } });
    if (slugTaken) {
      slug = `${slugBase}-${randomSuffix()}`;
    }

    const created = await strapi.documents('api::discussion.discussion').create({
      data: {
        title,
        content,
        type: discussionType as 'question' | 'discussion',
        category: categoryDoc.documentId,
        author: user.documentId, // ← auteur FORCÉ depuis le JWT, jamais depuis le body
        slug,
      },
      populate: { category: true },
    });

    ctx.status = 201;
    const sanitized = await this.sanitizeOutput!(created, ctx);
    const output = await this.transformResponse!(sanitized);
    // Le sanitizer content-api retire les relations vers le CT User : on
    // expose volontairement une représentation publique et minimale.
    (output as any).data.author = toAuthor(user);
    return output;
  }

  /**
   * Le sanitizer content-api de Strapi retire les relations vers
   * `plugin::users-permissions.user` (le CT User n'appartient pas au
   * content API). Pour exposer l'auteur et le nombre de réponses, on
   * complète donc la réponse du core controller par des requêtes batchées
   * (1 pour les auteurs, 1 pour les compteurs) — les filtres, le tri et la
   * pagination restent intégralement gérés par Strapi côté serveur.
   */
  async function attachAuthorsAndCounts(discussions: any[]) {
    const docIds = discussions.map((d) => d.documentId).filter(Boolean);
    if (docIds.length === 0) return;

    const rawDiscussions = (await strapi.db
      .query('api::discussion.discussion')
      .findMany({ where: { documentId: { $in: docIds } }, populate: ['author', 'category'] })) as Array<{
      documentId: string;
      author: Record<string, any> | null;
      category: Record<string, any> | null;
    }>;
    const authorByDocId = new Map(rawDiscussions.map((d) => [d.documentId, d.author]));
    const categoryByDocId = new Map(
      rawDiscussions.map((d) => [
        d.documentId,
        d.category
          ? {
              id: d.category.id,
              documentId: d.category.documentId ?? d.category.document_id,
              name: d.category.name,
              slug: d.category.slug,
            }
          : null,
      ])
    );

    const replies = (await strapi.db
      .query('api::reply.reply')
      .findMany({ where: { discussion: { documentId: { $in: docIds } } }, populate: ['discussion'] })) as Array<{
      discussion: { documentId: string } | null;
    }>;
    const countByDocId = new Map<string, number>();
    for (const reply of replies) {
      const key = reply.discussion?.documentId;
      if (key) countByDocId.set(key, (countByDocId.get(key) ?? 0) + 1);
    }

    for (const discussion of discussions) {
      discussion.author = toAuthor(authorByDocId.get(discussion.documentId));
      discussion.category = categoryByDocId.get(discussion.documentId) ?? null;
      discussion.replyCount = countByDocId.get(discussion.documentId) ?? 0;
    }
  }

  return {
    create: createDiscussion,

    async find(ctx) {
      const response = (await super.find(ctx)) as { data?: any[] | any; meta?: unknown };
      const discussions = Array.isArray(response?.data) ? response.data : [];
      await attachAuthorsAndCounts(discussions);
      return response;
    },

    async findOne(ctx) {
      const response = (await super.findOne(ctx)) as { data?: any; meta?: unknown };
      const discussion = response?.data;
      if (!discussion?.documentId) return response;

      const raw = (await strapi.db
        .query('api::discussion.discussion')
        .findOne({
        where: { documentId: discussion.documentId },
        populate: ['author'],
      })) as { author: Record<string, any> | null } | null;
      discussion.author = toAuthor(raw?.author);

      const replies = (await strapi.db
        .query('api::reply.reply')
        .findMany({
        where: { discussion: { documentId: discussion.documentId } },
        orderBy: { createdAt: 'asc' },
        populate: ['author'],
      })) as Array<Record<string, any>>;
      discussion.replies = replies.map((reply) => ({
        id: reply.id,
        documentId: reply.documentId ?? reply.document_id,
        content: reply.content,
        createdAt: reply.createdAt,
        author: toAuthor(reply.author as Record<string, any> | null),
      }));
      discussion.replyCount = replies.length;
      return response;
    },
  };
});
