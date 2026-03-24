# Kanban Hub

Kanban Hub is a collaborative Kanban app built with Next.js, Convex, and Better Auth.

## Requirements

- Node.js 20+
- pnpm 9+
- A Convex account

## Quick Setup

1. Clone the repository and install dependencies.

```bash
git clone git@github.com:cfardev/kanban-hub.git
cd kanban-hub
pnpm install
```

2. Initialize and link Convex (create/select a deployment).

```bash
pnpm convex dev
```

3. Create a `.env.local` file in the project root with the following variables.

```bash
NEXT_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=http://localhost:3000
BETTER_AUTH_SECRET=<long-random-secret>
BETTER_AUTH_BASE_URL=http://localhost:3000

# Optional (Google OAuth)
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=

# Optional (base URL alias)
SITE_URL=http://localhost:3000

# Optional (AI assistant with OpenRouter)
OPENROUTER_API_KEY=
OPENROUTER_MODEL=deepseek/deepseek-v3.2
```

4. Start the app.

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Environment Variables

- `NEXT_PUBLIC_CONVEX_URL`: your Convex deployment URL.
- `NEXT_PUBLIC_CONVEX_SITE_URL`: public frontend URL (local: `http://localhost:3000`).
- `BETTER_AUTH_SECRET`: secret used by Better Auth to sign cookies/tokens.
- `BETTER_AUTH_BASE_URL`: app base URL used by auth callbacks.
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: required only if you want Google login.
- `SITE_URL`: optional fallback for base URL/trusted origins.
- `OPENROUTER_API_KEY`: API key for OpenRouter (required to use the AI task assistant).
- `OPENROUTER_MODEL`: optional model override (default: `deepseek/deepseek-v3.2`).

Tip: generate `BETTER_AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## Useful Scripts

```bash
pnpm dev        # development
pnpm test       # watch tests
pnpm test:run   # run tests once
pnpm lint       # biome check --write
pnpm type-check # TypeScript check
pnpm build      # production build
pnpm verify     # lint + type-check + build
```

## Notes

- Public routes: `/sign-in`, `/sign-up`, `/api/auth/*`
- Protected routes: `/dashboard/*`
- Next.js auth endpoint: `src/app/api/auth/[...all]/route.ts`
- Better Auth HTTP routes in Convex: `convex/http.ts`
