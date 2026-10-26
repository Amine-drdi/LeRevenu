'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import * as api from '@/lib/api';
import type { AuthUser } from '@/types';

/**
 * Contexte d'authentification du forum.
 *
 * Stockage du JWT : localStorage (clés `le-revenu.jwt` / `le-revenu.user`).
 * Le jeton est transmis aux appels mutatifs via le header
 * `Authorization: Bearer` (voir `authedFetch` dans lib/api.ts) — jamais dans
 * une variable d'environnement NEXT_PUBLIC_ ni dans les URLs.
 *
 * Limite assumée et documentée : le localStorage est lisible par du JS
 * (risque XSS). Alternative en production : cookie httpOnly + route handler
 * Next.js faisant proxy des appels authentifiés.
 */

interface AuthState {
  user: AuthUser | null;
  jwt: string | null;
  loading: boolean;
}

interface AuthContextValue extends AuthState {
  login: (identifier: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ user: null, jwt: null, loading: true });

  // Hydratation depuis le localStorage au montage (client uniquement).
  useEffect(() => {
    const jwt = api.authStorage.getJwt();
    const user = api.authStorage.getUser<AuthUser>();
    if (jwt && user) {
      setState({ user, jwt, loading: false });
    } else {
      api.authStorage.clear();
      setState({ user: null, jwt: null, loading: false });
    }
  }, []);

  const persist = useCallback((jwt: string, user: AuthUser) => {
    api.authStorage.set(jwt, user);
    setState({ user, jwt, loading: false });
  }, []);

  const login = useCallback(
    async (identifier: string, password: string) => {
      const { jwt, user } = await api.login(identifier, password);
      persist(jwt, user);
    },
    [persist]
  );

  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const { jwt, user } = await api.register(username, email, password);
      persist(jwt, user);
    },
    [persist]
  );

  const logout = useCallback(() => {
    api.authStorage.clear();
    setState({ user: null, jwt: null, loading: false });
  }, []);

  const value = useMemo(
    () => ({ ...state, login, register, logout }),
    [state, login, register, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth doit être utilisé à l’intérieur de <AuthProvider>.');
  }
  return ctx;
}
