import { factories } from '@strapi/strapi';
import { randomSuffix, slugify } from '../../../utils/slug';

/** Joint auteur public + compteurs « Utile » à une liste de billets. */
async function attachMeta(strapi: any, blogs: any[], userId?: number) {
  const ids = blogs.map((b) => b.id).filter(Boolean);
  if (!ids.length) return;

  const authors = (await strapi.db
    .query('plugin::users-permissions.user')
    .findMany({ where: { id: { $in: blogs.map((b) => b.author?.id ?? b.author).filter(Boolean) } } })) as Array<Record<string, any>>;
  const authorById = new Map(authors.map((a) => [a.id, a]));
  const toAuthor = (a: Record<string, any> | null) =>
    a
      ? {
          documentId: a.documentId ?? a.document_id,
          username: a.username,
          title: a.title ?? null,
          is_redaction: !!a.is_redaction,
          photo: a.photo?.url ?? null,
        }
      : null;

  const likes = (await strapi.db
    .query('api::like.like')
    .findMany({ where: { blog_post: { id: { $in: ids } } }, populate: ['user'] })) as Array<{
    id: number;
    blog_post: { id: number } | null;
    user: { id: number } | null;
  }>;

  for (const blog of blogs) {
    const author = authorById.get(blog.author?.id ?? blog.author);
    blog.author = toAuthor(author ?? null);
    const bl = likes.filter((l) => l.blog_post?.id === blog.id);
    blog.likes = bl.length;
    blog.likedByMe = userId != null && bl.some((l) => l.user?.id === userId);
  }
}

export default factories.createCoreController('api::blog-post.blog-post', ({ strapi }) => ({
  /**
   * Publication d'un billet : policy U&P + middleware 401, puis garde 401,
   * auteur FORCÉ depuis le JWT, validation métier (titre ≥ 10, corps ≥ 60,
   * catégorie existante) et slug unique — même modèle que les discussions.
   */
  async create(ctx) {
    const user = ctx.state.user;
    if (!user) return ctx.unauthorized('Authentification requise pour publier un billet.');

    const body = (ctx.request.body as { data?: Record<string, unknown> } | undefined)?.data ?? {};
    const { title: rawTitle, body: rawBody, category: rawCategory } = body;

    const title = typeof rawTitle === 'string' ? rawTitle.trim().replace(/\s+/g, ' ') : '';
    if (title.length < 10) {
      return ctx.badRequest('Le titre doit contenir au moins 10 caractères.');
    }
    const content = typeof rawBody === 'string' ? rawBody.trim() : '';
    if (content.length < 60) {
      return ctx.badRequest('Le billet doit contenir au moins 60 caractères.');
    }

    let categoryDocId: string | null = null;
    if (rawCategory) {
      const categoryDoc = await strapi
        .documents('api::category.category')
        .findOne({ documentId: String(rawCategory) });
      if (!categoryDoc) return ctx.badRequest('La catégorie sélectionnée est invalide.');
      categoryDocId = categoryDoc.documentId;
    }

    const slugBase = slugify(title);
    let slug = `${slugBase}-${randomSuffix()}`;

    const created = await strapi.documents('api::blog-post.blog-post').create({
      data: {
        title,
        body: content,
        category: categoryDocId,
        author: user.documentId,
        slug,
      },
    });

    ctx.status = 201;
    return { data: { documentId: created.documentId, slug: created.slug, title: created.title } };
  },

  async find(ctx) {
    const response = (await super.find(ctx)) as { data?: any[] | any; meta?: unknown };
    const blogs = Array.isArray(response?.data) ? response.data : [];
    await attachMeta(strapi, blogs, ctx.state.user?.id);
    return response;
  },

  async findOne(ctx) {
    const response = (await super.findOne(ctx)) as { data?: any; meta?: unknown };
    const blog = response?.data;
    if (!blog?.id) return response;
    await attachMeta(strapi, [blog], ctx.state.user?.id);

    // Commentaires (réponses rattachées au billet) avec auteurs et « Utile ».
    const comments = (await strapi.db.query('api::reply.reply').findMany({
      where: { blog_post: blog.id },
      orderBy: { createdAt: 'asc' },
      populate: ['author'],
    })) as Array<Record<string, any>>;
    const likes = (await strapi.db.query('api::like.like').findMany({
      where: { reply: { id: { $in: comments.map((c) => c.id) } } },
      populate: ['user'],
    })) as Array<{ reply: { id: number } | null; user: { id: number } | null }>;
    blog.comments = comments.map((c) => ({
      documentId: c.documentId ?? c.document_id,
      content: c.content,
      createdAt: c.createdAt,
      author: blog.author && c.author?.id === (blog.author.id ?? blog.author)
        ? blog.author
        : c.author
          ? {
              documentId: c.author.documentId ?? c.author.document_id,
              username: c.author.username,
              title: c.author.title ?? null,
              is_redaction: !!c.author.is_redaction,
              photo: c.author.photo?.url ?? null,
            }
          : null,
      likes: likes.filter((l) => l.reply?.id === c.id).length,
      likedByMe:
        ctx.state.user != null && likes.some((l) => l.reply?.id === c.id && l.user?.id === ctx.state.user.id),
    }));
    return response;
  },
}));
