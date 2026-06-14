// API client for communicating with the backend server
// All requests go to /api (proxied by Vite to localhost:3001 in dev)
// Input: varies per function  Output: parsed JSON or throws Error with message

const BASE = '/api';

// Retrieve the stored session token from localStorage
function getToken(): string | null {
  return localStorage.getItem('token');
}

// Generic fetch helper that attaches Bearer token and handles errors
// Input: path string, RequestInit options  Output: parsed JSON response
async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error ?? `HTTP ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface User {
  id: number;
  username: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ScoreEntry {
  id: number;
  score: number;
  played_at: string;
}

export interface ScoresResponse {
  scores: ScoreEntry[];
  best: number | null;
}

// Sign up a new user account
// Input: username, password  Output: { token, user }
export function signup(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// Sign in with existing credentials
// Input: username, password  Output: { token, user }
export function login(username: string, password: string): Promise<AuthResponse> {
  return request<AuthResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

// Log out and invalidate the current session token
// Input: none  Output: void
export function logout(): Promise<void> {
  return request<void>('/auth/logout', { method: 'POST' });
}

// Fetch the currently authenticated user (used to restore login state on page load)
// Input: none  Output: { id, username }
export function getMe(): Promise<User> {
  return request<User>('/me');
}

// Save a completed game score for the logged-in user
// Input: score number  Output: saved ScoreEntry
export function saveScore(score: number): Promise<ScoreEntry> {
  return request<ScoreEntry>('/scores', {
    method: 'POST',
    body: JSON.stringify({ score }),
  });
}

// Fetch all scores and best score for the logged-in user
// Input: none  Output: { scores, best }
export function getScores(): Promise<ScoresResponse> {
  return request<ScoresResponse>('/scores');
}
