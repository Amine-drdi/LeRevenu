import { notFound } from 'next/navigation';

import type {
  ApiErrorBody,
  AuthResponse,
  AuthUser,
  BlogPost,
  Category,
  CommunityEvent,
  CreateDiscussionInput,
  CreateReplyInput,
  Discussion,
  LeaderboardData,
  MemberProfile,
  Reply,
  StrapiListResponse,
  StrapiSingleResponse,
} from '@/types';

/**
 * Client API centralisé et typé.
 *
 * Deux modes complémentaires :
 * - LECTURES (Server Components) : fetch serveur-à-serveur vers Strapi, avec
 *   ISR (`revalidate`) et cache tags pour de possibles revalidations.
 * - ÉCRITURES + AUTH (Client Components) : fetch navigateur avec le JWT en
 *   header `Authorization: Bearer` (lu depuis le localStorage, jamais dans
 *   une variable NEXT_PUBLIC_ : celles-ci seraient embarquées dans le bundle).
 */

const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? 'http://localhost:1337';
const API_URL = `${STRAPI_URL}/api`;

/** Durée de mise en cache ISR des lectures (secondes). */
const REVALIDATE = 60;

export class ApiRequestError extends Error {
  status: number;
  code: string;

  constructor(error: ApiErrorBody) {
    super(error.message);
    this.name = 'ApiRequestError';
    this.status = error.status;
    this.code = error.name;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as
    | ({ data: T; meta?: unknown } | { error: ApiErrorBody })
    | null;

  if (!res.ok) {
    const error = (body as { error?: ApiErrorBody } | null)?.error;
    throw new ApiRequestError(
      error ?? { status: res.status, name: res.statusText, message: 'Erreur API inattendue.' }
    );
  }
  return (body as { data: T }).data;
}

// ---------------------------------------------------------------------------
// LECTURES — utilisées par les Server Components (rendu initial côté serveur)
// ---------------------------------------------------------------------------

export interface DiscussionQuery {
  /** Slug de catégorie → filtrage côté backend (jamais côté client). */
  category?: string;
  sort?: 'createdAt:desc' | 'createdAt:asc';
  page?: number;
  pageSize?: number;
}

export async function getDiscussions(
  query: DiscussionQuery = {}
): Promise<StrapiListResponse<Discussion>> {
  const params = new URLSearchParams();
  params.set('sort', query.sort ?? 'createdAt:desc');
  params.set('pagination[page]', String(query.page ?? 1));
  params.set('pagination[pageSize]', String(query.pageSize ?? 10));
  if (query.category) {
    params.set('filters[category][slug][$eq]', query.category);
  }

  const res = await fetch(`${API_URL}/discussions?${params.toString()}`, {
    next: { revalidate: REVALIDATE, tags: ['discussions'] },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (body as { error?: ApiErrorBody } | null)?.error;
    throw new ApiRequestError(
      error ?? { status: res.status, name: res.statusText, message: 'Erreur API inattendue.' }
    );
  }
  return body as StrapiListResponse<Discussion>;
}

/** Détail par slug (URL propre) — lève `notFound()` si le slug n'existe pas. */
export async function getDiscussionBySlug(slug: string): Promise<Discussion> {
  const params = new URLSearchParams({ 'filters[slug][$eq]': slug });
  const res = await fetch(`${API_URL}/discussions?${params.toString()}`, {
    next: { revalidate: REVALIDATE, tags: [`discussion:${slug}`] },
  });
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const error = (body as { error?: ApiErrorBody } | null)?.error;
    throw new ApiRequestError(
      error ?? { status: res.status, name: res.statusText, message: 'Erreur API inattendue.' }
    );
  }
  const json = body as StrapiListResponse<Discussion>;
  if (json.data.length === 0) notFound();
  return json.data[0];
}

export async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_URL}/categories?sort=name:asc`, {
    next: { revalidate: 300, tags: ['categories'] },
  });
  return parseResponse<Category[]>(res);
}

// ---------------------------------------------------------------------------
// STOCKAGE DU JWT (navigateur uniquement) + requêtes authentifiées
// ---------------------------------------------------------------------------

const JWT_KEY = 'le-revenu.jwt';
const USER_KEY = 'le-revenu.user';

export const authStorage = {
  getJwt(): string | null {
    if (typeof window === 'undefined') return null;
    return window.localStorage.getItem(JWT_KEY);
  },
  getUser<T>(): T | null {
    if (typeof window === 'undefined') return null;
    const raw = window.localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      window.localStorage.removeItem(USER_KEY);
      return null;
    }
  },
  set(jwt: string, user: unknown): void {
    window.localStorage.setItem(JWT_KEY, jwt);
    window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  },
  clear(): void {
    window.localStorage.removeItem(JWT_KEY);
    window.localStorage.removeItem(USER_KEY);
  },
};

async function authedFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const jwt = authStorage.getJwt();
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      ...(init.headers ?? {}),
    },
  });
  return parseResponse<T>(res);
}

// ---------------------------------------------------------------------------
// AUTH + ÉCRITURES — appelés depuis les Client Components
// ---------------------------------------------------------------------------

/**
 * Les endpoints /auth/local* ne suivent pas l'enveloppe du content API :
 * ils répondent `{ jwt, user }` à la racine (pas de `data`). D'où un parseur
 * dédié — parseResponse (enveloppe `data`) renverrait `undefined` et ferait
 * échouer la déstructuration `{ jwt, user }` dans l'AuthContext.
 */
async function parseAuthResponse(res: Response): Promise<AuthResponse> {
  const body = (await res.json().catch(() => null)) as
    | ({ jwt: string; user: AuthUser } | { error: ApiErrorBody })
    | null;

  if (!res.ok) {
    const error = (body as { error?: ApiErrorBody } | null)?.error;
    throw new ApiRequestError(
      error ?? { status: res.status, name: res.statusText, message: 'Erreur API inattendue.' }
    );
  }
  return body as AuthResponse;
}

export async function login(identifier: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/local`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier, password }),
  });
  return parseAuthResponse(res);
}

export async function register(
  username: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await fetch(`${API_URL}/auth/local/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  });
  return parseAuthResponse(res);
}

/**
 * Création d'une discussion. L'auteur est forcé côté Strapi (anti-usurpation) :
 * le body n'envoie que title/content/type/category.
 */
export async function createDiscussion(input: CreateDiscussionInput): Promise<Discussion> {
  return authedFetch<Discussion>('/discussions', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });
}

/** Création d'une réponse — renvoie la réponse créée (auteur peuplé côté API). */
export async function createReply(input: CreateReplyInput): Promise<Reply> {
  return authedFetch<Reply>('/replies', {
    method: 'POST',
    body: JSON.stringify({ data: input }),
  });
}

// ---------------------------------------------------------------------------
// COMMUNAUTÉ (étape 7) — lectures publiques + mutations authentifiées
// ---------------------------------------------------------------------------

/** Mutations dont la réponse n'a pas d'enveloppe `data` (réponses brutes {…}). */
async function parseMutation<T>(res: Response): Promise<T> {
  const body = (await res.json().catch(() => null)) as (T & { error?: ApiErrorBody }) | null;
  if (!res.ok) {
    throw new ApiRequestError(
      body?.error ?? { status: res.status, name: res.statusText, message: 'Erreur API inattendue.' }
    );
  }
  return body as T;
}

async function authedMutation<T>(path: string, payload: unknown): Promise<T> {
  const jwt = authStorage.getJwt();
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  return parseMutation<T>(res);
}

export async function getEvents(): Promise<CommunityEvent[]> {
  const params = new URLSearchParams({ sort: 'at:asc', populate: 'category' });
  const res = await fetch(`${API_URL}/events?${params.toString()}`, {
    next: { revalidate: 60, tags: ['events'] },
  });
  return parseResponse<CommunityEvent[]>(res);
}

export function toggleRsvp(
  eventId: string
): Promise<{ going: boolean; participants: number }> {
  return authedMutation('/event-rsvp/toggle', { eventId });
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const params = new URLSearchParams({ sort: 'createdAt:desc', populate: 'category' });
  const res = await fetch(`${API_URL}/blog-posts?${params.toString()}`, {
    next: { revalidate: 60, tags: ['blog'] },
  });
  return parseResponse<BlogPost[]>(res);
}

/** Détail d'un billet par slug — lève `notFound()` si inconnu. */
export async function getBlogPostBySlug(slug: string): Promise<BlogPost> {
  const params = new URLSearchParams({ 'filters[slug][$eq]': slug, populate: 'category' });
  const res = await fetch(`${API_URL}/blog-posts?${params.toString()}`, {
    next: { revalidate: 60, tags: [`blog:${slug}`] },
  });
  const json = (await res.json().catch(() => null)) as
    | (StrapiListResponse<BlogPost> & { error?: ApiErrorBody })
    | null;
  if (!res.ok || !json) {
    throw new ApiRequestError(
      json?.error ?? { status: res.status, name: res.statusText, message: 'Erreur API inattendue.' }
    );
  }
  if (json.data.length === 0) notFound();
  return json.data[0];
}

export async function getLeaderboard(period: 'month' | 'all'): Promise<LeaderboardData> {
  const res = await fetch(`${API_URL}/leaderboard?period=${period}`, {
    next: { revalidate: 60, tags: ['leaderboard'] },
  });
  return parseResponse<LeaderboardData>(res);
}

export async function getMember(username: string): Promise<MemberProfile> {
  const res = await fetch(`${API_URL}/members/${encodeURIComponent(username)}`, {
    next: { revalidate: 60, tags: [`member:${username}`] },
  });
  return parseResponse<MemberProfile>(res);
}

export function castPollVote(
  discussionId: string,
  option: number
): Promise<{ myVote: number; tally: number[]; total: number }> {
  return authedMutation('/poll-vote/cast', { discussionId, option });
}

export function toggleLike(
  targetType: 'discussion' | 'reply' | 'blog-post',
  targetId: string
): Promise<{ liked: boolean; likes: number }> {
  return authedMutation('/like/toggle', { targetType, targetId });
}
