# Kanban Hub

Kanban Hub is a collaborative kanban workspace focused on team planning with realtime updates, invitations, and rich task management.

## Current Status

The current implementation includes:

- Multi-board workspace with board CRUD
- Board access control with owner/member roles
- Board invitations by email (accept/reject)
- Participant management (owner removes users, member can leave)
- Task CRUD with drag-and-drop between statuses
- Status flow: `por_empezar` → `en_curso` → `terminado`
- Tags per board with color system (max 3 tags per task)
- Subtasks (create, edit, toggle complete, reorder, delete)
- Task comments (create, edit, delete)
- Activity log for board/task actions
- Realtime presence avatars inside each board
- Authentication with Better Auth (email/password + Google)
- Route protection for `/dashboard/*`
- Light/dark theme toggle and responsive UI

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Frontend**: React 19 + TypeScript
- **Styles**: Tailwind CSS 4 + design tokens in `src/app/globals.css`
- **UI**: Shadcn/ui (Radix primitives)
- **Backend**: Convex (queries, mutations, actions)
- **Auth**: Better Auth + Convex integration (`@convex-dev/better-auth`)
- **Realtime Presence**: `@convex-dev/presence`
- **Drag and Drop**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Animation**: `motion`
- **Testing**: Vitest + Testing Library
- **Linting/Formatting**: Biome

## Architecture Notes

- Next.js auth API route: `src/app/api/auth/[...all]/route.ts`
- Better Auth HTTP routes mounted in Convex: `convex/http.ts`
- Route protection middleware: `src/proxy.ts`
- Public routes: `/sign-in`, `/sign-up`, `/api/auth/*`
- Protected routes: `/dashboard/*`

## Local Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Run tests in watch mode
pnpm test

# Run tests once (CI mode)
pnpm test:run

# Lint and auto-fix
pnpm lint

# Type checking
pnpm type-check

# Production build
pnpm build

# Full local verification (lint + type-check + build)
pnpm verify
```

## Project Structure

```text
kanban-hub/
├── src/
│   ├── app/            # Next.js App Router pages and API routes
│   ├── components/     # UI and feature components
│   ├── lib/            # Client/server helpers and shared utilities
│   └── test/           # Test setup
├── convex/             # Convex schema, queries, mutations, actions, auth routes
└── AGENTS.md           # Project-specific instructions for coding agents
```
