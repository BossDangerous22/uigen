# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Code Style

- Use comments sparingly. Only comment complex code.

## Commands

```bash
npm run dev          # Start dev server (Turbopack)
npm run build        # Production build
npm run lint         # ESLint via Next.js
npm run test         # Run all Vitest tests
npm run setup        # Install deps + generate Prisma client + run migrations
npm run db:reset     # Force reset database and migrations
```

Run a single test file:
```bash
npx vitest src/lib/__tests__/file-system.test.ts
```

## Environment

- `ANTHROPIC_API_KEY` — required for real AI generation; falls back to mock static output if absent
- `JWT_SECRET` — JWT signing key; defaults to `"development-secret-key"` in dev

## Architecture

**UIGen** is an AI-powered React component generator. Users describe components in a chat interface, Claude generates the code, and a live preview renders the result in an iframe. Authenticated users have their projects persisted to SQLite.

### Request Flow

1. User sends a chat message → `POST /api/chat` (`src/app/api/chat/route.ts`)
2. Route calls `streamText()` (Vercel AI SDK) with the Anthropic model and two tools
3. AI uses `str_replace_editor` to create/modify files and `file_manager` to rename/delete
4. File changes arrive via streaming tool calls and update the in-memory virtual file system
5. The preview iframe picks up changes and re-transforms the JSX via Babel Standalone

### Virtual File System

`src/lib/file-system.ts` — An in-memory class (no disk writes). Files are serialized to JSON for database persistence. The AI always writes to `/App.jsx` as the component entry point.

### AI Tools (`src/lib/tools/`)

- `str-replace.ts` — Create, view, and patch files using str-replace semantics
- `file-manager.ts` — Rename and delete files

The system prompt lives in `src/lib/prompts/generation.tsx` and instructs the model to use Tailwind CSS and the virtual file system.

### JSX Transform (`src/lib/transform/jsx-transformer.ts`)

Babel Standalone runs in the browser to transform JSX to plain JS. An import map is constructed pointing `react` and `react-dom` to esm.sh CDN so the iframe can load modules without a bundler.

### Layout

Three resizable panels (`react-resizable-panels`):
- **Left (35%)**: Chat (`src/components/chat/`)
- **Right (65%)**: Preview (`src/components/preview/PreviewFrame.tsx`) or Code view (file tree + Monaco editor)

### Auth

JWT cookies (7-day expiry, `jose`), bcrypt password hashing. `src/middleware.ts` protects API routes. Session logic is in `src/lib/auth.ts` and server actions in `src/actions/`.

### Database

Prisma + SQLite (`prisma/dev.db`). Schema: `User` → `Project` (stores serialized messages JSON + virtual file system JSON).

### Contexts

- `src/lib/contexts/file-system-context.tsx` — provides the virtual FS to the component tree
- `src/lib/contexts/chat-context.tsx` — wraps Vercel AI SDK's `useChat`, syncs messages and files

### Provider

`src/lib/provider.ts` — returns the Anthropic model when `ANTHROPIC_API_KEY` is set, otherwise returns a mock that emits static code.
