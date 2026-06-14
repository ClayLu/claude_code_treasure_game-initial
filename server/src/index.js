// Express app entry point — mounts all routes and starts listening on port 3001
import express from 'express';
import cors from 'cors';
import { router as authRouter } from './auth.js';
import { router as scoresRouter } from './scores.js';

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => res.json({ ok: true }));

// Auth routes: /api/auth/signup, /api/auth/login, /api/auth/logout, /api/me
app.use('/api/auth', authRouter);
app.get('/api/me', (req, res, next) => {
  // Delegate /api/me to the auth router's me handler
  req.url = '/me';
  authRouter(req, res, next);
});

// Scores routes: POST /api/scores, GET /api/scores
app.use('/api/scores', scoresRouter);

app.listen(PORT, () => {
  console.log(`🏴‍☠️  Treasure Game server running at http://localhost:${PORT}`);
});
