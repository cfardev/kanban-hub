# Project Instructions

## Current Tech Stack

- **Framework**: Next.js 16 (App Router, routes under `src/app/`)
- **Frontend**: React 19 + TypeScript
- **Styles**: Tailwind CSS 4 + global design tokens in `src/app/globals.css`
- **UI Base**: Shadcn/ui (Radix primitives)
- **Backend**: Convex (queries, mutations, actions)
- **Auth**: Better Auth integrated with Convex (`@convex-dev/better-auth`)
- **Realtime Presence**: `@convex-dev/presence`
- **DnD**: `@dnd-kit/core` + `@dnd-kit/sortable`
- **Animation**: `motion`
- **Testing**: Vitest + Testing Library
- **Lint/Format**: Biome

## Current Product Scope

- Multi-board kanban workspace with board CRUD
- Task CRUD with drag-and-drop status/position updates
- Tags per board (max 3 tags per task)
- Subtasks per task (create, edit, complete, reorder, delete)
- Comments in tasks (create, edit, delete)
- Activity log per board/task
- Board invitations by email (accept/reject)
- Participants management (owner removes users, member can leave board)
- Presence avatars for users online in the same board
- Authentication with email/password and Google social login
- Light/dark theme toggle

## Code Style

- Use strict TypeScript and functional React components
- Prefer server components; use client components only when needed
- Use kebab-case for file and folder names
- Use Biome (do not use ESLint/Prettier)
- Use Shadcn/ui components as base UI primitives
- Install missing Shadcn/ui components with `pnpm dlx shadcn@latest add <component>`

## Structure and Conventions

- **App routes**: `src/app/`
- **UI and feature components**: `src/components/`
- **Utilities**: `src/lib/`
- **Convex functions and schema**: `convex/`
- **Tests**: colocated using `.test.ts` and `.test.tsx`
- **Convex tables/fields**: lower snake_case
- **Kanban task statuses**: `por_empezar`, `en_curso`, `terminado`

## Auth and Route Protection

- Better Auth HTTP routes are mounted in Convex (`convex/http.ts`)
- Next auth API endpoint is `src/app/api/auth/[...all]/route.ts`
- Route protection is implemented in `src/proxy.ts`
- Public routes: `/sign-in`, `/sign-up`, `/api/auth/*`
- Protected area: `/dashboard/*`

## Convex Guidelines

- Use queries for reads, mutations for writes, actions for external/compound logic
- Validate authorization in every function touching board-scoped data
- Use indexes for hot paths (`by_board`, `by_board_status`, etc.)
- Keep ownership/membership checks explicit for board access
- Soft delete boards via `active: false` (do not hard delete board docs)

## UI/UX Guidelines

- Keep mobile-first responsive layouts
- Use accessible labels, focus states, and button semantics
- Keep `cursor-pointer` on interactive/clickable objects
- Preserve existing visual language (tokens, cards, subtle motion)

## Commands

- Dev: `pnpm dev`
- Test (watch): `pnpm test`
- Test (CI): `pnpm test:run`
- Build: `pnpm build`
- Lint + autofix: `pnpm lint`
- Type check: `pnpm type-check`
- Full local verification: `pnpm verify`

## Conventional Commits

- Format: `type(scope): subject`
- Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`
- Subject: lowercase, imperative, no trailing period
- Examples:
  - `feat(auth): add google sign-in flow`
  - `fix(convex): validate board membership on task updates`
  - `refactor(ui): simplify task dialog actions`
  - `docs(readme): refresh project status and setup`
