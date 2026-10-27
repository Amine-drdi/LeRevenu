import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { notify, notifyMentions, toAuthor } from '../../../utils/community';

const { ValidationError } = errors;

export default factories.createCoreController('api::reply.reply', ({ strapi }) => ({
  /**
   * Création d'une réponse (discussion) ou d'un commentaire (billet) — même
   * modèle de sécurité que la discussion : policy U&P + normalisation 401,
   * garde 401, auteur FORCÉ depuis le JWT, validation métier côté serveur.
   * Notifie l'auteur de la cible, ses suivants et les membres mentionnés.
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentification requise pour répondre.');
    }

    const body = (ctx.request.body as { data?: Record<string, unknown> } | undefined)?.data ?? {};
    const { content: rawContent, discussion, blog_post: blogPost } = body;

    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (content.length === 0) {
      throw new ValidationError('Le contenu de la réponse est obligatoire.');
    }

    // Exactement une cible : discussion OU billet.
    if ((discussion ? 1 : 0) + (blogPost ? 1 : 0) !== 1) {
      throw new ValidationError('Une seule cible : discussion ou billet.');
    }

    let target: { kind: 'discussion' | 'blog'; id: number; authorId: number };
    if (discussion) {
      const doc = (await strapi.db
        .query('api::discussion.discussion')
        .findOne({ where: { documentId: String(discussion) }, populate: ['author'] })) as
        | { id: number; author: { id: number } | null }
        | null;
      if (!doc) throw new ValidationError('La discussion ciblée est introuvable.');
      target = { kind: 'discussion', id: doc.id, authorId: doc.author?.id ?? 0 };
    } else {
      const doc = (await strapi.db
        .query('api::blog-post.blog-post')
        .findOne({ where: { documentId: String(blogPost) }, populate: ['author'] })) as
        | { id: number; author: { id: number } | null }
        | null;
      if (!doc) throw new ValidationError('Le billet ciblé est introuvable.');
      target = { kind: 'blog', id: doc.id, authorId: doc.author?.id ?? 0 };
    }

    const created = await strapi.documents('api::reply.reply').create({
      data: {
        content,
        ...(target.kind === 'discussion'
          ? { discussion: target.id }
          : { blog_post: target.id }),
        author: user.documentId, // ← auteur FORCÉ depuis le JWT
      },
    });

    // Notifications : auteur de la cible, suivants de la discussion, mentions.
    if (target.kind === 'discussion') {
      const discussionRow = { id: target.id };
      if (target.authorId) {
        await notify(strapi, {
          user: { id: target.authorId },
          actor: user,
          type: 'reply',
          message: 'a répondu à votre discussion',
          discussion: discussionRow,
        });
      }
      const followers = (await strapi.db.query('api::follow.follow').findMany({
        where: { discussion: target.id },
        populate: ['user'],
      })) as Array<{ user: { id: number } | null }>;
      for (const f of followers) {
        if (f.user) {
          await notify(strapi, {
            user: f.user,
            actor: user,
            type: 'reply',
            message: 'a répondu dans une discussion que vous suivez',
            discussion: discussionRow,
          });
        }
      }
      await notifyMentions(strapi, content, user, discussionRow);
    } else {
      if (target.authorId) {
        await notify(strapi, {
          user: { id: target.authorId },
          actor: user,
          type: 'reply',
          message: 'a commenté votre billet',
        });
      }
      await notifyMentions(strapi, content, user, null);
    }

    ctx.status = 201;
    const sanitized = await this.sanitizeOutput!(created, ctx);
    const output = await this.transformResponse!(sanitized);
    // Voir discussion.ts : le sanitizer retire les relations vers le CT User.
    (output as any).data.author = toAuthor(user);
    return output;
  },
}));
