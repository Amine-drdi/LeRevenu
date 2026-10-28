/**
 * Types partagés du frontend — miroir exact des contrats de réponse de l'API
 * Strapi (règle de cohérence front/back : les noms de champs correspondent).
 */

export type DiscussionType = 'question' | 'discussion' | 'poll';

/** Auteur tel qu'exposé par l'API (représentation publique minimale). */
export interface Author {
  documentId: string;
  username: string;
  title?: string | null;
  is_redaction?: boolean;
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
  likes?: number;
  likedByMe?: boolean;
}

export interface Poll {
  options: Array<{ label: string; votes: number }>;
  total: number;
  myVote: number | null;
}

export interface SolutionRef {
  documentId: string;
  verified: boolean;
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
  /** Sondage (type "poll") : options, résultats, mon vote. */
  poll?: Poll | null;
  /** Meilleure réponse choisie (documentId d'une réponse). */
  solution?: SolutionRef | null;
  likes?: number;
  likedByMe?: boolean;
  views?: number;
}

export interface BlogComment {
  documentId: string;
  content: string;
  createdAt: string;
  author: Author | null;
  likes: number;
  likedByMe: boolean;
}

export interface BlogPost {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  body: string;
  createdAt: string;
  author: Author | null;
  category?: Category | null;
  likes: number;
  likedByMe: boolean;
  /** Présent sur le détail (findOne). */
  comments?: BlogComment[];
}

export interface CommunityEvent {
  id: number;
  documentId: string;
  title: string;
  host: string;
  at: string;
  category?: Category | null;
  participants?: number;
  /** Présent si la requête est authentifiée. */
  me?: boolean;
}

export interface PublicMember {
  documentId: string;
  username: string;
  name: string;
  bio: string | null;
  title: string | null;
  is_redaction: boolean;
  is_moderator: boolean;
  photo: string | null;
  createdAt: string;
  interests: string[];
}

export interface MemberStats {
  points: number;
  monthPoints: number;
  counts: {
    replies: number;
    topics: number;
    blogs: number;
    votes: number;
    likesReceived: number;
    solutions: number;
  };
  level: { index: number; name: string; min: number; next: number | null; nextName: string | null };
  streak: number;
}

export interface MemberProfile {
  user: PublicMember;
  stats: MemberStats;
  badges: {
    earned: string[];
    definitions: Array<{ code: string; label: string; desc: string }>;
  };
  levels: Array<{ min: number; name: string }>;
}

export interface LeaderboardData {
  period: 'month' | 'all';
  rows: Array<{ rank: number; user: PublicMember; points: number; monthPoints: number }>;
  rules: Array<[string, number]>;
  levels: Array<{ min: number; name: string }>;
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
  discussion?: string;
  /** documentId du billet (commentaire de blog) — une seule cible. */
  blog_post?: string;
}
