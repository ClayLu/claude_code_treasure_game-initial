// Auth context — manages login/signup/guest state and persists token in localStorage
// Input: children ReactNode  Output: AuthProvider component and useAuth hook
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import * as api from '../lib/api';
import type { User } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isGuest: boolean;
  loading: boolean;
  signup: (username: string, password: string) => Promise<void>;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  continueAsGuest: () => void;
  exitGuest: () => void;
}

const AuthContext = createContext<AuthState | null>(null);

// Provide auth state to the entire app; restores session from localStorage on mount
// Input: children  Output: context provider wrapping children
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  // On mount: restore session if a token exists in localStorage
  useEffect(() => {
    const stored = localStorage.getItem('token');
    if (!stored) {
      setLoading(false);
      return;
    }
    api.getMe()
      .then((u) => {
        setUser(u);
        setToken(stored);
      })
      .catch(() => {
        localStorage.removeItem('token');
      })
      .finally(() => setLoading(false));
  }, []);

  // Sign up a new account, store the token, and update state
  // Input: username, password  Output: void (throws on error)
  async function signup(username: string, password: string) {
    const res = await api.signup(username, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  }

  // Sign in with existing credentials
  // Input: username, password  Output: void (throws on error)
  async function login(username: string, password: string) {
    const res = await api.login(username, password);
    localStorage.setItem('token', res.token);
    setToken(res.token);
    setUser(res.user);
  }

  // Log out and clear all auth state
  // Input: none  Output: void
  async function logout() {
    try {
      await api.logout();
    } catch {
      // ignore network errors — still clear local state
    }
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
    setIsGuest(false);
  }

  // Enter guest mode without touching the backend or storing anything
  // Input: none  Output: void
  function continueAsGuest() {
    setIsGuest(true);
  }

  // Exit guest mode and return to the auth screen
  // Input: none  Output: void
  function exitGuest() {
    setIsGuest(false);
  }

  return (
    <AuthContext.Provider value={{ user, token, isGuest, loading, signup, login, logout, continueAsGuest, exitGuest }}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to access auth state; must be used inside AuthProvider
// Input: none  Output: AuthState
export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
