---
name: better-auth
description: Guide for working with Better Auth integrated with Convex in this project. Use when setting up authentication, creating auth functions, protecting routes, or working with user sessions. Includes Convex integration patterns and best practices.
---

# Better Auth with Convex

## Overview

Better Auth runs on Convex as a component, providing authentication capabilities integrated with the Convex backend. Auth operations run in Convex functions and can be called from the client via hooks or from server code.

## Installation

Install Better Auth and the Convex component:

```bash
pnpm add better-auth@1.4.9 --save-exact
pnpm add @convex-dev/better-auth
```

## Environment Variables

Set environment variables in Convex (not `.env.local`):

```bash
# Generate secret
pnpm dlx convex env set BETTER_AUTH_SECRET=$(openssl rand -base64 32)

# Set site URL
pnpm dlx convex env set SITE_URL http://localhost:3000
```

Add to `.env.local` for Next.js:

```sh
NEXT_PUBLIC_CONVEX_SITE_URL=https://adjective-animal-123.convex.site
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Important**: Auth-related env vars (`BETTER_AUTH_SECRET`, `GITHUB_CLIENT_ID`, etc.) must be set via Convex CLI or dashboard, not in `.env.local`.

## File Structure

```
convex/
├── auth.config.ts          # Auth config provider
├── betterAuth/
│   ├── convex.config.ts    # Component definition
│   ├── auth.ts             # Better Auth instance
│   ├── schema.ts           # Generated schema
│   └── adapter.ts          # Adapter functions
├── auth.ts                 # Auth-related queries/mutations
└── http.ts                 # HTTP routes for auth

lib/
├── auth-client.ts          # Client instance
└── auth-server.ts          # Server helpers

app/
└── api/
    └── auth/
        └── [...all]/
            └── route.ts    # Next.js auth routes
```

## Setup Steps

### 1. Auth Config Provider

```typescript
// convex/auth.config.ts
import { getAuthConfigProvider } from "@convex-dev/better-auth/auth-config";
import type { AuthConfig } from "convex/server";

export default {
  providers: [getAuthConfigProvider()],
} satisfies AuthConfig;
```

### 2. Component Definition

```typescript
// convex/betterAuth/convex.config.ts
import { defineComponent } from "convex/server";

const component = defineComponent("betterAuth");

export default component;
```

### 3. Register Component

```typescript
// convex/convex.config.ts
import { defineApp } from "convex/server";
import betterAuth from "./betterAuth/convex.config";

const app = defineApp();
app.use(betterAuth);

export default app;
```

### 4. Better Auth Instance

```typescript
// convex/betterAuth/auth.ts
import { createClient } from "@convex-dev/better-auth";
import { convex } from "@convex-dev/better-auth/plugins";
import type { GenericCtx } from "@convex-dev/better-auth/utils";
import type { BetterAuthOptions } from "better-auth";
import { betterAuth } from "better-auth";
import { components } from "../_generated/api";
import type { DataModel } from "../_generated/dataModel";
import authConfig from "../auth.config";
import schema from "./schema";

// Better Auth Component
export const authComponent = createClient<DataModel, typeof schema>(
  components.betterAuth,
  {
    local: { schema },
    verbose: false,
  },
);

// Better Auth Options
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    appName: "My App",
    baseURL: process.env.SITE_URL,
    secret: process.env.BETTER_AUTH_SECRET,
    database: authComponent.adapter(ctx),
    emailAndPassword: {
      enabled: true,
    },
    plugins: [convex({ authConfig })],
  } satisfies BetterAuthOptions;
};

// For @better-auth/cli
export const options = createAuthOptions({} as GenericCtx<DataModel>);

// Better Auth Instance
export const createAuth = (ctx: GenericCtx<DataModel>) => {
  return betterAuth(createAuthOptions(ctx));
};
```

### 5. Generate Schema

After configuring auth instance, generate the schema:

```bash
pnpm dlx @better-auth/cli generate --config ./convex/betterAuth/auth.ts --output ./convex/betterAuth/schema.ts
```

Run this command again whenever you modify the auth instance.

### 6. Adapter Functions

```typescript
// convex/betterAuth/adapter.ts
import { createApi } from "@convex-dev/better-auth";
import { createAuthOptions } from "./auth";
import schema from "./schema";

export const {
  create,
  findOne,
  findMany,
  updateOne,
  updateMany,
  deleteOne,
  deleteMany,
} = createApi(schema, createAuthOptions);
```

### 7. Client Instance

```typescript
// lib/auth-client.ts
import { convexClient } from "@convex-dev/better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  plugins: [convexClient()],
});
```

### 8. Server Helpers

```typescript
// lib/auth-server.ts
import { convexBetterAuthNextJs } from "@convex-dev/better-auth/nextjs";

export const {
  handler,
  preloadAuthQuery,
  isAuthenticated,
  getToken,
  fetchAuthQuery,
  fetchAuthMutation,
  fetchAuthAction,
} = convexBetterAuthNextJs({
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL!,
  convexSiteUrl: process.env.NEXT_PUBLIC_CONVEX_SITE_URL!,
});
```

### 9. HTTP Routes

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { authComponent, createAuth } from "./betterAuth/auth";

const http = httpRouter();
authComponent.registerRoutes(http, createAuth);

export default http;
```

```typescript
// app/api/auth/[...all]/route.ts
import { handler } from "@/lib/auth-server";

export const { GET, POST } = handler;
```

### 10. Convex Client Provider

```typescript
// components/ConvexClientProvider.tsx
"use client";

import { ConvexBetterAuthProvider } from "@convex-dev/better-auth/react";
import { ConvexReactClient } from "convex/react";
import { authClient } from "@/lib/auth-client";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({
  children,
  initialToken,
}: {
  children: React.ReactNode;
  initialToken?: string | null;
}) {
  return (
    <ConvexBetterAuthProvider
      client={convex}
      authClient={authClient}
      initialToken={initialToken}
    >
      {children}
    </ConvexBetterAuthProvider>
  );
}
```

```typescript
// app/layout.tsx
import { ConvexClientProvider } from "@/components/ConvexClientProvider";
import { getToken } from "@/lib/auth-server";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const token = await getToken();
  return (
    <html>
      <body>
        <ConvexClientProvider initialToken={token}>
          {children}
        </ConvexClientProvider>
      </body>
    </html>
  );
}
```

## Creating Auth Functions

Better Auth's `auth.api` methods run in Convex functions. Create auth-related functions in `convex/auth.ts`:

```typescript
// convex/auth.ts
import { query, mutation } from "./_generated/server";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    return identity;
  },
});

export const requireAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return identity;
  },
});
```

## Client Usage

### Using Better Auth Client

Use `authClient` for authentication operations:

```typescript
"use client";

import { authClient } from "@/lib/auth-client";

// Sign in with email/password
await authClient.signIn.email({
  email: "user@example.com",
  password: "password",
  callbackURL: "/dashboard",
});

// Sign in with social provider
await authClient.signIn.social({
  provider: "github",
  callbackURL: "/dashboard",
});

// Sign out
await authClient.signOut({
  fetchOptions: {
    onSuccess: () => {
      router.push("/");
    },
  },
});

// Sign up
await authClient.signUp.email({
  email: "user@example.com",
  password: "password",
  name: "User Name",
});
```

### Using Convex React Hooks

Query auth data using Convex hooks:

```typescript
"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export function UserProfile() {
  const user = useQuery(api.auth.getCurrentUser);

  if (user === undefined) {
    return <div>Loading...</div>;
  }

  if (user === null) {
    return <div>Not authenticated</div>;
  }

  return <div>Hello, {user.name}</div>;
}
```

## Server Usage

### Protecting Server Components

```typescript
// app/protected/page.tsx
import { isAuthenticated } from "@/lib/auth-server";

export default async function ProtectedPage() {
  const hasToken = await isAuthenticated();
  
  if (!hasToken) {
    return <div>Unauthorized</div>;
  }

  return <div>Protected content</div>;
}
```

### SSR with Preloading

Preload auth queries in server components:

```typescript
// app/landing/page.tsx
import { api } from "@/convex/_generated/api";
import { preloadAuthQuery } from "@/lib/auth-server";
import Header from "./header";

export default async function LandingPage() {
  const preloadedUserQuery = await preloadAuthQuery(api.auth.getCurrentUser);

  return (
    <div>
      <Header preloadedUserQuery={preloadedUserQuery} />
    </div>
  );
}
```

```typescript
// app/landing/header.tsx
"use client";

import { usePreloadedAuthQuery } from "@convex-dev/better-auth/nextjs/client";
import type { Preloaded } from "convex/react";
import type { api } from "@/convex/_generated/api";

export function Header({
  preloadedUserQuery,
}: {
  preloadedUserQuery: Preloaded<typeof api.auth.getCurrentUser>;
}) {
  const user = usePreloadedAuthQuery(preloadedUserQuery);
  
  return (
    <div>
      {user ? <div>Welcome, {user.name}</div> : <div>Sign in</div>}
    </div>
  );
}
```

### Server Actions/Mutations

Use server helpers to call auth-related mutations:

```typescript
// app/actions.ts
"use server";

import { fetchAuthMutation } from "@/lib/auth-server";
import { api } from "@/convex/_generated/api";

export async function updateProfile(data: { name: string }) {
  await fetchAuthMutation(api.auth.updateProfile, { name: data.name });
}
```

## Protecting Convex Functions

### In Queries/Mutations

```typescript
import { query, mutation } from "./_generated/server";

export const getMyData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    // Use identity.tokenIdentifier or identity.subject
    return await ctx.db
      .query("userData")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .collect();
  },
});

export const createData = mutation({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    
    return await ctx.db.insert("userData", {
      userId: identity.subject,
      data: args.data,
    });
  },
});
```

## Common Patterns

### Get Current User Helper

```typescript
// convex/auth.ts
export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.auth.getUserIdentity();
  },
});

export const requireUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Authentication required");
    }
    return identity;
  },
});
```

### User-Scoped Queries

```typescript
export const getUserTasks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }
    
    return await ctx.db
      .query("tasks")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .collect();
  },
});
```

### Session Management

```typescript
export const getSession = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }
    
    // Access session info from identity
    return {
      userId: identity.subject,
      email: identity.email,
      name: identity.name,
    };
  },
});
```

## Best Practices

1. **Always check authentication** in protected functions using `ctx.auth.getUserIdentity()`
2. **Use `identity.subject`** as the user ID (consistent identifier)
3. **Throw errors** for unauthenticated access rather than returning null
4. **Preload auth queries** for SSR when needed for UI decisions
5. **Use server helpers** (`fetchAuthMutation`, etc.) in server components/actions
6. **Store user ID** in documents using `identity.subject` for user-scoped data
7. **Create indexes** on `userId` fields for efficient user-scoped queries
8. **Set environment variables** via Convex CLI, not `.env.local` for auth config

## Authentication Providers

Configure providers in `convex/betterAuth/auth.ts`:

```typescript
export const createAuthOptions = (ctx: GenericCtx<DataModel>) => {
  return {
    // ... other options
    emailAndPassword: {
      enabled: true,
    },
    socialProviders: {
      github: {
        clientId: process.env.GITHUB_CLIENT_ID!,
        clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      },
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  } satisfies BetterAuthOptions;
};
```

Set provider credentials via Convex:

```bash
pnpm dlx convex env set GITHUB_CLIENT_ID=your_client_id
pnpm dlx convex env set GITHUB_CLIENT_SECRET=your_client_secret
```

## References

- [Better Auth Convex Integration](https://www.better-auth.com/docs/integrations/convex)
- [Convex Documentation](https://docs.convex.dev/home)
- [`@convex-dev/better-auth` Docs](https://labs.convex.dev/better-auth)
