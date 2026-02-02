---
name: convex
description: Guide for working with Convex in this project. Use when creating queries, mutations, actions, schemas, or working with the Convex backend. Includes validation patterns, indexes, internal functions, HTTP endpoints, and best practices.
---

# Convex Backend

## File Structure

- **Schema**: `convex/schema.ts` - Defines all tables and validations (always define here)
- **Queries/Mutations/Actions**: `convex/*.ts` - Each file exports related functions
- **HTTP**: `convex/http.ts` - HTTP routes via `httpRouter` and `httpAction`
- **Generated**: `convex/_generated/` - Auto-generated; do not edit manually

## Function Registration

- **Public**: `query`, `mutation`, `action` — part of app API, callable from client. Use for app-facing APIs.
- **Internal**: `internalQuery`, `internalMutation`, `internalAction` — private, callable only from other Convex functions. Use for sensitive or internal logic.
- Import internal from `./_generated/server`; reference via `internal` from `./_generated/api` (e.g. `internal.tasks.helper`).
- **Always** include `args` and `returns` validators on every function. Use `returns: v.null()` when the function returns nothing.
- Convex uses file-based routing: `convex/tasks.ts` → `api.tasks.list` (public) or `internal.tasks.helper` (internal).

## Schema

Define tables in `convex/schema.ts` with `defineTable` and validators from `convex/values`:

```typescript
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    boardId: v.optional(v.id("boards")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
  }).index("by_board", ["boardId"]),
});
```

### System Fields

Every document gets: `_id` (`v.id(tableName)`), `_creationTime` (`v.number()`). Do not define these in the table validator.

### Index Naming and Order

- **Name**: Include all index fields in the index name (e.g. `["field1", "field2"]` → `"by_field1_and_field2"`).
- **Order**: Index fields must be queried in the same order they are defined. For different orderings, define separate indexes.

### Common Validators (Schema & Args)

| Convex Type | TS/JS type   | Validator              | Notes |
|-------------|--------------|------------------------|-------|
| Id          | string       | `v.id("tableName")`    | Doc reference |
| Null        | null         | `v.null()`             | Use instead of `undefined` for "no value" |
| Int64       | bigint       | `v.int64()`            | Prefer over deprecated `v.bigint()` |
| Float64     | number       | `v.number()`           | IEEE-754 double |
| Boolean     | boolean      | `v.boolean()`          | |
| String      | string       | `v.string()`           | UTF-8, &lt; 1MB |
| Bytes       | ArrayBuffer  | `v.bytes()`            | &lt; 1MB |
| Array       | Array        | `v.array(v.string())`  | Max 8192 elements |
| Object      | Object       | `v.object({ a: v.string() })` | Plain objects, max 1024 entries, keys not `$`/`_` |
| Record      | Record       | `v.record(v.string(), v.number())` | Dynamic keys; use `v.record()`, not `v.map()`/`v.set()` |

- `v.optional(v.string())` — optional string.
- **Discriminated union** in schema:

```typescript
defineTable(
  v.union(
    v.object({ kind: v.literal("error"), errorMessage: v.string() }),
    v.object({ kind: v.literal("success"), value: v.number() })
  )
)
```

## Queries

Queries read data; they are reactive. **Do not use `filter()`** — define an index and use `withIndex()` instead.

- Use `.unique()` for a single document (throws if multiple match).
- Default order is ascending `_creationTime`. Use `.order("asc")` or `.order("desc")`.
- For async iteration use `for await (const row of query)` instead of `.collect()`/`.take(n)` when appropriate.
- Queries do **not** support `.delete()`; collect results and call `ctx.db.delete(row._id)` in a mutation.

```typescript
import { query } from "./_generated/server";
import { v } from "convex/values";

export const list = query({
  args: {},
  returns: v.array(v.any()), // or a proper doc validator
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  returns: v.union(v.any(), v.null()),
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByBoard = query({
  args: { boardId: v.id("boards") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
  },
});
```

### Query Patterns

**With index (preferred over filter):**
```typescript
ctx.db
  .query("tasks")
  .withIndex("by_board", (q) => q.eq("boardId", boardId))
  .order("desc")
  .collect()
```

**Paginated:**
```typescript
import { paginationOptsValidator } from "convex/server";

args: { paginationOpts: paginationOptsValidator, author: v.string() },
handler: async (ctx, args) => {
  return await ctx.db
    .query("messages")
    .withIndex("by_author", (q) => q.eq("author", args.author))
    .order("desc")
    .paginate(args.paginationOpts);
}
// Returns { page, isDone, continueCursor }
```

**Full-text search:**
```typescript
await ctx.db
  .query("messages")
  .withSearchIndex("search_body", (q) =>
    q.search("body", "hello hi").eq("channel", "#general")
  )
  .take(10);
```

## Mutations

Mutations modify data. Always validate `args` and set `returns`.

- `ctx.db.insert(table, doc)` — insert; returns `Id<table>`.
- `ctx.db.patch(id, updates)` — shallow merge; throws if doc does not exist.
- `ctx.db.replace(id, doc)` — full replace; throws if doc does not exist.
- `ctx.db.delete(id)` — delete document.

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
  },
  returns: v.id("tasks"),
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
    return null;
  },
});
```

## Actions

Use for async I/O or external calls. **No `ctx.db`** in actions — use `ctx.runQuery`/`ctx.runMutation` instead.

- Add `"use node";` at the top of files that use Node built-in modules.
- Always define `returns` (e.g. `returns: v.null()`).

```typescript
import { action } from "./_generated/server";
import { api } from "./_generated/api";
import { v } from "convex/values";

export const syncExternal = action({
  args: { data: v.string() },
  returns: v.any(),
  handler: async (ctx, args) => {
    const response = await fetch("https://api.example.com/data");
    const result = await response.json();
    await ctx.runMutation(api.tasks.create, {
      title: result.title,
      status: "todo",
    });
    return result;
  },
});
```

- Prefer minimal calls from actions to queries/mutations to avoid race conditions. Prefer one transaction when possible.
- Call another action only when crossing runtimes (e.g. V8 → Node); otherwise share logic via a helper and call it directly.

## Internal Functions

Use when logic must not be exposed to the client:

```typescript
import { internalMutation, internalQuery } from "./_generated/server";
import { internal } from "./_generated/api";

export const helper = internalQuery({
  args: { boardId: v.id("boards") },
  returns: v.array(v.any()),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
  },
});

// From another function (e.g. action):
const tasks = await ctx.runQuery(internal.tasks.helper, { boardId });
```

- Use `FunctionReference` from `api`/`internal` — do not pass the handler function itself.
- When calling a function in the **same file** via `ctx.runQuery`/`runMutation`/`runAction`, add a type annotation on the return to avoid TS circularity: `const result: string = await ctx.runQuery(api.example.f, { name: "Bob" });`

## HTTP Endpoints

Define in `convex/http.ts` with `httpRouter` and `httpAction`. Path is exact (e.g. `/api/someRoute`).

```typescript
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();
http.route({
  path: "/echo",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    return new Response(body, { status: 200 });
  }),
});

export default http;
```

## Cron

Use only `crons.interval` or `crons.cron` (not `crons.hourly`/`daily`/`weekly`). Pass a `FunctionReference`; export default the crons object.

```typescript
import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();
crons.interval("cleanup", { hours: 2 }, internal.crons.cleanup, {});
export default crons;
```

## File Storage

- Use `ctx.storage.getUrl(id)` for signed URLs (returns `null` if missing).
- File metadata: query `_storage` system table with `ctx.db.system.get("_storage", fileId)`; do not use deprecated `ctx.storage.getMetadata`.
- Storage uses `Blob`; convert to/from Blob when reading/writing.

## TypeScript

 - **Ids**: Use `Id<"tableName">` from `./_generated/dataModel` for table IDs (e.g. args, variables).
- **Docs**: Use `Doc<"tableName">` for document types.
- **Record with Id keys**: `v.record(v.id("users"), v.string())` → type `Record<Id<"users">, string>`.
- Use `as const` for string literals in discriminated unions.
- Add `@types/node` when using Node built-in modules.

## Frontend (React)

Provider is in `ConvexClientProvider.tsx`. Use hooks in client components:

```typescript
"use client";

import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";

const tasks = useQuery(api.tasks.list);
const createTask = useMutation(api.tasks.create);
const runAction = useAction(api.tasks.syncExternal);
// Handle tasks === undefined for loading
```

- `useQuery(api.module.function, args?)` — reactive
- `useMutation(api.module.function)` — returns callable function
- `useAction(api.module.function)` — same for actions
- `useConvex()` — raw Convex client

## Best Practices

1. **Validators**: Always `args` + `returns` on every function; use `v.null()` for no return.
2. **Indexes**: Use indexes and `withIndex()` for filtered/ordered queries; avoid `filter()`.
3. **Timestamps**: Set `createdAt`/`updatedAt` with `Date.now()` in mutations.
4. **Loading**: In React, treat `useQuery` result `undefined` as loading.
5. **Naming**: Descriptive names (e.g. `getByBoard`); one file per domain (tasks, boards).
6. **References**: Validate related docs exist (e.g. `ctx.db.get(args.boardId)`) before inserting refs.
7. **Internal vs public**: Use internal functions for sensitive or internal-only logic.

## Common Patterns

### Reference validation before insert

```typescript
const board = await ctx.db.get(args.boardId);
if (!board) throw new Error("Board not found");
return await ctx.db.insert("tasks", { ... });
```

### Partial update

```typescript
const { id, ...fields } = args;
await ctx.db.patch(id, { ...fields, updatedAt: Date.now() });
return null;
```

### Legacy data migration in a query

```typescript
return (await ctx.db.query("tasks").collect()).map((task) =>
  task.text && !task.title
    ? { ...task, title: task.text, status: task.isCompleted ? "done" : "todo" }
    : task
);
```

### Scheduler (e.g. from mutation)

```typescript
await ctx.scheduler.runAfter(0, internal.tasks.generateResponse, { channelId });
```
