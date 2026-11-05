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

Tip: generate `BETTER_AUTH_SECRET` with:

```bash
openssl rand -base64 32
```

## MCP Server

AI is driven from an MCP client (Claude Code, Claude Desktop, Cursor…) instead of an in-app assistant. The server in `mcp/server.ts` acts as your user and exposes: `list_boards`, `get_board`, `create_task`, `update_task`, `delete_task`, `add_subtask`, `add_comment`.

1. Sign in to the app, open your profile and click **Copiar token MCP**.
2. Register the server in your client (requires Node 22.18+ to run TypeScript directly):

```json
{
  "mcpServers": {
    "kanban-hub": {
      "command": "node",
      "args": ["/absolute/path/to/kanban-hub/mcp/server.ts"],
      "env": {
        "KANBAN_URL": "http://localhost:3000",
        "CONVEX_URL": "https://<your-deployment>.convex.cloud",
        "KANBAN_TOKEN": "<token from step 1>"
      }
    }
  }
}
```

Claude Code: `claude mcp add kanban-hub -e KANBAN_URL=... -e CONVEX_URL=... -e KANBAN_TOKEN=... -- node /absolute/path/to/kanban-hub/mcp/server.ts`

The token is your Better Auth session: it stops working when you sign out or the session expires; copy a new one then.

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
