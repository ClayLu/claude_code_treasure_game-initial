// Scores routes: save and retrieve game scores for authenticated users
// Input: Express Router  Output: Router with POST / and GET /
import { Router } from 'express';
import { requireAuth } from './auth.js';
import db from './db.js';

export const router = Router();

// POST /api/scores — save a completed game score for the current user
// Input: { score: number }, Authorization header  Output: { id, score, played_at }
router.post('/', requireAuth, (req, res) => {
  const { score } = req.body ?? {};
  if (score === undefined || typeof score !== 'number') {
    return res.status(400).json({ error: 'score (number) is required' });
  }
  const result = db.prepare(
    'INSERT INTO scores (user_id, score) VALUES (?, ?)'
  ).run(req.userId, score);

  const saved = db.prepare('SELECT id, score, played_at FROM scores WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(saved);
});

// GET /api/scores — get all scores and best score for the current user
// Input: Authorization header  Output: { scores: [...], best: number | null }
router.get('/', requireAuth, (req, res) => {
  const scores = db.prepare(
    'SELECT id, score, played_at FROM scores WHERE user_id = ? ORDER BY played_at DESC'
  ).all(req.userId);

  const best = scores.length > 0 ? Math.max(...scores.map(s => s.score)) : null;
  res.json({ scores, best });
});
