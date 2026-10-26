/**
 * Types partagés du frontend — miroir exact des contrats de réponse de l'API
 * Strapi (règle de cohérence front/back : les noms de champs correspondent).
 */

export type DiscussionType = 'question' | 'discussion';

/** Auteur tel qu'exposé par l'API (représentation publique minimale). */
export interface Author {
  documentId: string;
  username: string;
}

export interface Category {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description?: string | null;
}

export interface Reply {
  id: number;
  documentId: string;
  content: string;
  createdAt: string;
  author: Author | null;
}

export interface Discussion {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  content: string;
  type: DiscussionType;
  createdAt: string;
  updatedAt: string;
  author: Author | null;
  /** Peuplé uniquement quand la catégorie est demandée (création, listes filtrées). */
  category?: Category | null;
  /** Présent uniquement sur le détail (findOne). */
  replies?: Reply[];
  /** Enrichi par le contrôleur (find / findOne). */
  replyCount?: number;
}

export interface StrapiListResponse<T> {
  data: T[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

export interface AuthUser {
  id: number;
  documentId: string;
  username: string;
  email: string;
}

export interface AuthResponse {
  jwt: string;
  user: AuthUser;
}

export interface ApiErrorBody {
  status: number;
  name: string;
  message: string;
}

/** Entrées des formulaires de création. */
export interface CreateDiscussionInput {
  title: string;
  content: string;
  type: DiscussionType;
  /** documentId de la catégorie. */
  category: string;
}

export interface CreateReplyInput {
  content: string;
  /** documentId de la discussion. */
  discussion: string;
}
