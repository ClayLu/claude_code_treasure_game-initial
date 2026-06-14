# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

This project has two independent processes that must both be running in dev:

```bash
# Frontend (React/Vite) — http://localhost:3000
npm install
npm run dev

# Backend (Express) — http://localhost:3001
cd server && npm install
npm run dev   # uses node --watch for auto-reload
```

```bash
npm run build   # build frontend to build/
```

There is no lint or test script configured.

## Architecture

This is a two-process app: a React 18 + TypeScript frontend (Vite) and a Node.js/Express backend with SQLite.

### Frontend (`src/`)

**Game logic** (`src/App.tsx`): Three treasure boxes; one is randomly assigned treasure per game. Clicking opens it, awards +$100 for treasure or -$50 for skeleton. Game ends when treasure is found or all boxes are opened. Final score is posted to the backend for logged-in users.

**Auth flow**: On load, `AuthProvider` (`src/auth/AuthContext.tsx`) restores the session by calling `GET /api/me` with the stored token. If no valid session, `AuthScreen` (`src/components/AuthScreen.tsx`) is shown. Users can also play as guest (no score persistence).

**API layer** (`src/lib/api.ts`): All requests go to `/api` (Vite proxies this to `localhost:3001` in dev). Attaches `Authorization: Bearer <token>` from `localStorage` automatically.

**UI components** (`src/components/ui/`): Pre-built shadcn/ui components (Radix UI + Tailwind). Don't modify unless specifically required.

**Styling**: Tailwind CSS v4 with design tokens in `src/styles/globals.css` under `@theme inline`. Amber color palette drives the visual theme.

**Animations**: Uses `motion` (Framer Motion v11+) via `import { motion } from 'motion/react'` — not `framer-motion`.

**Assets**:
- Images: `src/assets/` — `treasure_closed.png`, `treasure_opened.png`, `treasure_opened_skeleton.png`, `key.png`
- Audio: `src/audios/` — `chest_open.mp3` (treasure reveal), `chest_open_with_evil_laugh.mp3` (skeleton reveal)

**Path alias**: `@` resolves to `src/`.

**Image fallback**: `src/components/figma/ImageWithFallback.tsx` renders a placeholder SVG on image load error — use it instead of `<img>` when the image source may be unreliable.

### Backend (`server/`)

Express 5 server listening on port 3001. Uses ES modules (`"type": "module"`).

**Routes**:
- `POST /api/auth/signup` — create account, return `{ token, user }`
- `POST /api/auth/login` — verify credentials, return `{ token, user }`
- `POST /api/auth/logout` — delete session token
- `GET /api/me` — return current user (requires Bearer token)
- `POST /api/scores` — save a game score (auth required)
- `GET /api/scores` — return score history + best score for the user (auth required)

**Auth middleware** (`server/src/auth.js`): `requireAuth` reads the `Authorization: Bearer` header, looks up the token in the `sessions` table, and attaches `req.userId`.

**Database** (`server/src/db.js`): SQLite via `better-sqlite3`, stored at `server/data/game.db` (WAL mode). Three tables: `users`, `sessions`, `scores`. Schema is created automatically on startup via `CREATE TABLE IF NOT EXISTS`.
