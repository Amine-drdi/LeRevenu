import { factories } from '@strapi/strapi';
import { errors } from '@strapi/utils';
import { randomSuffix, slugify } from '../../../utils/slug';
import { notify, notifyMentions, toAuthor } from '../../../utils/community';

const { ValidationError } = errors;

export default factories.createCoreController('api::discussion.discussion', ({ strapi }) => {
  /**
   * Sécurité — la policy Users & Permissions reste la première ligne
   * (403 → normalisé 401 par le middleware), ce contrôleur est la ligne finale :
   * 1. JWT obligatoire → 401 explicite ;
   * 2. anti-usurpation : l'auteur est FORCÉ depuis ctx.state.user ;
   * 3. validation métier côté serveur (titre ≥ 10, contenu, type enum
   *    question/discussion/poll, sondage : 2 à 6 options, catégorie existante).
   */
  async function createDiscussion(this: any, ctx: any) {
    const user = ctx.state.user;
    if (!user) {
      return ctx.unauthorized('Authentification requise pour créer une discussion.');
    }

    // Whitelist stricte : tout champ hors liste est ignoré (notamment `author`,
    // `featured`, `pinned`, `solution` — réservés au serveur et au seed).
    const body = (ctx.request.body as { data?: Record<string, unknown> } | undefined)?.data ?? {};
    const { title: rawTitle, content: rawContent, type, category, poll_options: rawOptions } = body;

    const title = typeof rawTitle === 'string' ? rawTitle.trim().replace(/\s+/g, ' ') : '';
    if (title.length < 10) {
      throw new ValidationError('Le titre doit contenir au moins 10 caractères.');
    }

    const content = typeof rawContent === 'string' ? rawContent.trim() : '';
    if (content.length === 0) {
      throw new ValidationError('Le contenu est obligatoire.');
    }

    const discussionType = typeof type === 'string' ? type : '';
    if (!['question', 'discussion', 'poll'].includes(discussionType)) {
      throw new ValidationError('Le type doit être "question", "discussion" ou "poll".');
    }

    let pollOptions: Array<{ label: string }> | null = null;
    if (discussionType === 'poll') {
      if (!Array.isArray(rawOptions)) {
        throw new ValidationError('Un sondage a besoin de poll_options (2 à 6 réponses).');
      }
      const labels = rawOptions
        .map((o: unknown) => (typeof o === 'string' ? o : (o as { label?: unknown })?.label))
        .filter((l: unknown): l is string => typeof l === 'string')
        .map((l: string) => l.trim())
        .filter((l: string) => l.length > 0);
      if (labels.length < 2 || labels.length > 6) {
        throw new ValidationError('Un sondage compte entre 2 et 6 réponses non vides.');
      }
      if (labels.some((l: string) => l.length > 80)) {
        throw new ValidationError('Chaque réponse de sondage fait au plus 80 caractères.');
      }
      pollOptions = labels.map((label) => ({ label }));
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
        type: discussionType as 'question' | 'discussion' | 'poll',
        poll_options: pollOptions,
        category: categoryDoc.documentId,
        author: user.documentId, // ← auteur FORCÉ depuis le JWT, jamais depuis le body
        slug,
      },
      populate: { category: true },
    });

    // L'auteur suit automatiquement sa propre discussion.
    await strapi.db.query('api::follow.follow').create({
      data: { user: user.id, discussion: created.id },
    });

    ctx.status = 201;
    const sanitized = await this.sanitizeOutput!(created, ctx);
    const output = await this.transformResponse!(sanitized);
    (output as any).data.author = toAuthor(user);
    return output;
  }

  /**
   * Enrichit une page de discussions pour les cartes du fil : auteur, catégorie,
   * compteur de réponses, « Utile » (total + mien), suiveurs, état solution,
   * et résultats de sondage — le tout en requêtes batchées (3-4 par page,
   * indépendante de la taille de la page).
   */
  async function attachCardMeta(discussions: any[], userId?: number) {
    const ids = discussions.map((d) => d.id).filter(Boolean);
    if (!ids.length) return;

    const raws = (await strapi.db
      .query('api::discussion.discussion')
      .findMany({ where: { id: { $in: ids } }, populate: ['solution'] })) as Array<{
      id: number;
      solution: { id: number; documentId: string } | null;
      poll_options: unknown;
    }>;
    const rawById = new Map(raws.map((r) => [r.id, r]));

    const [likes, follows, votes] = await Promise.all([
      strapi.db.query('api::like.like').findMany({
        where: { discussion: { id: { $in: ids } } },
        populate: ['user'],
      }) as Promise<Array<{ discussion: { id: number } | null; user: { id: number } | null }>>,
      strapi.db.query('api::follow.follow').findMany({
        where: { discussion: { id: { $in: ids } } },
        populate: ['user'],
      }) as Promise<Array<{ discussion: { id: number } | null; user: { id: number } | null }>>,
      strapi.db.query('api::poll-vote.poll-vote').findMany({
        where: { discussion: { id: { $in: ids } } },
        populate: ['user'],
      }) as Promise<Array<{ discussion: { id: number } | null; user: { id: number } | null; option: number }>>,
    ]);

    for (const discussion of discussions) {
      const raw = rawById.get(discussion.id);
      const dl = likes.filter((l) => l.discussion?.id === discussion.id);
      discussion.likes = dl.length;
      discussion.likedByMe = userId != null && dl.some((l) => l.user?.id === userId);

      const df = follows.filter((f) => f.discussion?.id === discussion.id);
      discussion.follows = df.length;
      discussion.followedByMe = userId != null && df.some((f) => f.user?.id === userId);

      discussion.solution = raw?.solution
        ? { documentId: raw.solution.documentId, verified: !!discussion.solution_verified }
        : null;

      const options = Array.isArray(raw?.poll_options) ? (raw!.poll_options as Array<{ label: string }>) : [];
      const dv = votes.filter((v) => v.discussion?.id === discussion.id);
      discussion.poll =
        discussion.type === 'poll'
          ? {
              options: options.map((o, i) => ({
                label: o.label,
                votes: dv.filter((v) => v.option === i).length,
              })),
              total: dv.length,
              myVote: userId != null ? (dv.find((v) => v.user?.id === userId)?.option ?? null) : null,
            }
          : null;
    }
  }

  /**
   * Le sanitizer content-api retire les relations vers le CT User. On complète
   * la réponse par des requêtes batchées (1 auteurs/catégories, 1 compteurs) —
   * filtres, tri et pagination restent intégralement gérés par Strapi.
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

  /**
   * Joint les réponses (avec auteur public, « Utile », ordre chronologique) à
   * chaque discussion donnée. Utilisé par findOne et — quand la requête filtre
   * sur un slug unique — par find : le frontend charge le détail par slug
   * (GET /discussions?filters[slug][$eq]=…) et reçoit tout en un seul appel.
   */
  async function attachReplies(discussions: any[], userId?: number) {
    const docIds = discussions.map((d) => d.documentId).filter(Boolean);
    if (docIds.length === 0) return;

    const replies = (await strapi.db
      .query('api::reply.reply')
      .findMany({
        where: { discussion: { documentId: { $in: docIds } } },
        orderBy: { createdAt: 'asc' },
        populate: ['author', 'discussion'],
      })) as Array<Record<string, any>>;

    const replyIds = replies.map((r) => r.id);
    const likeRows = replyIds.length
      ? ((await strapi.db.query('api::like.like').findMany({
          where: { reply: { id: { $in: replyIds } } },
          populate: ['user'],
        })) as Array<{ reply: { id: number } | null; user: { id: number } | null }>)
      : [];

    const repliesByDocId = new Map<string, Array<Record<string, any>>>();
    for (const reply of replies) {
      const key = reply.discussion?.documentId;
      if (!key) continue;
      const rl = likeRows.filter((l) => l.reply?.id === reply.id);
      const publicReply = {
        id: reply.id,
        documentId: reply.documentId ?? reply.document_id,
        content: reply.content,
        createdAt: reply.createdAt,
        author: toAuthor(reply.author),
        likes: rl.length,
        likedByMe: userId != null && rl.some((l) => l.user?.id === userId),
      };
      const list = repliesByDocId.get(key) ?? [];
      list.push(publicReply);
      repliesByDocId.set(key, list);
    }

    for (const discussion of discussions) {
      const list = repliesByDocId.get(discussion.documentId) ?? [];
      discussion.replies = list;
      discussion.replyCount = list.length;
    }
  }

  return {
    create: createDiscussion,

    async find(ctx) {
      // Filtre maison « Sans réponse » : on exclut les discussions ayant des réponses.
      const unanswered = (ctx.query as Record<string, any>).unanswered === 'true';
      delete (ctx.query as Record<string, any>).unanswered;
      if (unanswered) {
        const withReplies = (await strapi.db.query('api::reply.reply').findMany({
          select: ['id'],
          populate: ['discussion'],
        })) as Array<{ discussion: { id: number } | null }>;
        const ids = [...new Set(withReplies.map((r) => r.discussion?.id).filter(Boolean))];
        const q = ctx.query as Record<string, any>;
        q.filters = { ...(q.filters ?? {}), id: { $notIn: ids.length ? ids : [0] }, type: { $ne: 'poll' } };
      }

      const response = (await super.find(ctx)) as { data?: any[] | any; meta?: unknown };
      const discussions = Array.isArray(response?.data) ? response.data : [];
      await attachAuthorsAndCounts(discussions);
      await attachCardMeta(discussions, ctx.state.user?.id);

      // Détail par slug unique (frontend : getDiscussionBySlug) → réponses jointes.
      const slugEq = (ctx.query as Record<string, any>)?.filters?.slug?.$eq;
      if (slugEq && discussions.length > 0) {
        await attachReplies(discussions, ctx.state.user?.id);
      }
      return response;
    },

    async findOne(ctx) {
      const response = (await super.findOne(ctx)) as { data?: any; meta?: unknown };
      const discussion = response?.data;
      if (!discussion?.documentId) return response;

      // Compteur de vues (lecture du détail).
      await strapi.db.query('api::discussion.discussion').update({
        where: { id: discussion.id },
        data: { views: (discussion.views ?? 0) + 1 },
      });
      discussion.views = (discussion.views ?? 0) + 1;

      await attachAuthorsAndCounts([discussion]);
      await attachCardMeta([discussion], ctx.state.user?.id);
      await attachReplies([discussion], ctx.state.user?.id);

      // La meilleure réponse complète : elle fait déjà partie de replies (jointes
      // ci-dessus) — le frontend la résout par documentId.
      return response;
    },

    /**
     * Choisir / déchoisir la meilleure réponse (auteur de la question ou
     * rédaction uniquement) et, pour la rédaction, valider la réponse.
     */
    async solution(ctx) {
      const user = ctx.state.user;
      if (!user) return ctx.unauthorized('Authentification requise.');

      const { id } = ctx.params;
      const { replyId, verified } = (ctx.request.body as Record<string, any>) ?? {};

      const discussion = (await strapi.db
        .query('api::discussion.discussion')
        .findOne({ where: { documentId: String(id) }, populate: ['author'] })) as
        | { id: number; author: { id: number } | null }
        | null;
      if (!discussion) throw new ValidationError('Discussion introuvable.');

      const isAuthor = discussion.author?.id === user.id;
      const fullUser = (await strapi.db
        .query('plugin::users-permissions.user')
        .findOne({ where: { id: user.id } })) as Record<string, any> | null;
      const isRedaction = !!fullUser?.is_redaction;

      if (verified !== undefined) {
        if (!isRedaction) {
          return ctx.forbidden('Seule la rédaction peut vérifier une réponse.');
        }
        await strapi.db.query('api::discussion.discussion').update({
          where: { id: discussion.id },
          data: { solution_verified: !!verified },
        });
        return { ok: true, verified: !!verified };
      }

      if (!isAuthor && !isRedaction) {
        return ctx.forbidden('Seul l\'auteur (ou la rédaction) choisit la meilleure réponse.');
      }
      if (!replyId) {
        await strapi.db.query('api::discussion.discussion').update({
          where: { id: discussion.id },
          data: { solution: null },
        });
        return { ok: true, solution: null };
      }
      const reply = (await strapi.db
        .query('api::reply.reply')
        .findOne({ where: { documentId: String(replyId), discussion: discussion.id } })) as
        | { id: number }
        | null;
      if (!reply) throw new ValidationError('Cette réponse n\'appartient pas à la discussion.');

      await strapi.db.query('api::discussion.discussion').update({
        where: { id: discussion.id },
        data: { solution: reply.id },
      });
      const replyRow = (await strapi.db
        .query('api::reply.reply')
        .findOne({ where: { id: reply.id }, populate: ['author'] })) as { author: { id: number } | null };
      if (replyRow?.author) {
        await notify(strapi, {
          user: replyRow.author,
          actor: user,
          type: 'badge',
          message: 'Votre réponse a été choisie comme meilleure réponse (+20 points)',
          discussion,
        });
      }
      return { ok: true };
    },
  };
});
