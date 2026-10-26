import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';

const { ValidationError } = errors;

const toAuthor = (user: Record<string, any> | null | undefined) =>
  user
    ? { documentId: user.documentId ?? user.document_id ?? '', username: user.username ?? 'anonyme' }
    : null;

export default factories.createCoreController('api::reply.reply', ({ strapi }) => ({
  /**
   * Création d'une réponse — même modèle de sécurité que la discussion :
   * policy U&P + normalisation 401 par middleware, puis dans le contrôleur :
   * garde 401, auteur FORCÉ depuis le JWT (anti-usurpation) et validation
   * métier côté serveur.
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentification requise pour répondre.');
    }

    const body = (ctx.request.body as { data?: Record<string, unknown> } | undefined)?.data ?? {};
    const { content: rawContent, discussion } = body;

    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (content.length === 0) {
      throw new ValidationError('Le contenu de la réponse est obligatoire.');
    }

    if (!discussion) {
      throw new ValidationError('La discussion cible est obligatoire.');
    }
    const discussionDoc = await strapi
      .documents('api::discussion.discussion')
      .findOne({ documentId: String(discussion) });
    if (!discussionDoc) {
      throw new ValidationError('La discussion ciblée est introuvable.');
    }

    const created = await strapi.documents('api::reply.reply').create({
      data: {
        content,
        discussion: discussionDoc.documentId,
        author: user.documentId, // ← auteur FORCÉ depuis le JWT
      },
    });

    ctx.status = 201;
    const sanitized = await this.sanitizeOutput!(created, ctx);
    const output = await this.transformResponse!(sanitized);
    // Voir discussion.ts : le sanitizer retire les relations vers le CT User.
    (output as any).data.author = toAuthor(user);
    return output;
  },
}));
