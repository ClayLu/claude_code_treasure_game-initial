// Auth routes: signup, login, logout, me + requireAuth middleware
// Inputs: Express Router  Output: Router with /signup /login /logout /me + exported requireAuth
import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import db from './db.js';

export const router = Router();

// Middleware: verify Bearer token and attach userId to req
// Input: req with Authorization header  Output: calls next() or 401
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  const token = header.slice(7);
  const session = db.prepare('SELECT user_id FROM sessions WHERE token = ?').get(token);
  if (!session) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
  req.userId = session.user_id;
  next();
}

// POST /api/auth/signup — create a new user account and return a session token
// Input: { username, password }  Output: { token, user: { id, username } }
router.post('/signup', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const existing = db.prepare('SELECT id FROM users WHERE username = ?').get(username);
  if (existing) {
    return res.status(409).json({ error: 'Username already taken' });
  }
  const password_hash = await bcrypt.hash(password, 10);
  const result = db.prepare(
    'INSERT INTO users (username, password_hash) VALUES (?, ?)'
  ).run(username, password_hash);

  const token = uuidv4();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, result.lastInsertRowid);

  res.status(201).json({ token, user: { id: result.lastInsertRowid, username } });
});

// POST /api/auth/login — verify credentials and return a session token
// Input: { username, password }  Output: { token, user: { id, username } }
router.post('/login', async (req, res) => {
  const { username, password } = req.body ?? {};
  if (!username || !password) {
    return res.status(400).json({ error: 'username and password are required' });
  }
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const match = await bcrypt.compare(password, user.password_hash);
  if (!match) {
    return res.status(401).json({ error: 'Invalid username or password' });
  }
  const token = uuidv4();
  db.prepare('INSERT INTO sessions (token, user_id) VALUES (?, ?)').run(token, user.id);

  res.json({ token, user: { id: user.id, username: user.username } });
});

// POST /api/auth/logout — invalidate the current session token
// Input: Authorization header  Output: 204 No Content
router.post('/logout', requireAuth, (req, res) => {
  const token = req.headers.authorization.slice(7);
  db.prepare('DELETE FROM sessions WHERE token = ?').run(token);
  res.sendStatus(204);
});

// GET /api/me — return the currently authenticated user
// Input: Authorization header  Output: { id, username }
router.get('/me', requireAuth, (req, res) => {
  const user = db.prepare('SELECT id, username FROM users WHERE id = ?').get(req.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});
