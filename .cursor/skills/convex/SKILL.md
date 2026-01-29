---
name: convex
description: Guide for working with Convex in this project. Use when creating queries, mutations, actions, schemas, or working with the Convex backend. Includes validation patterns, indexes, and best practices.
---

# Convex Backend

## File Structure

- **Schema**: `convex/schema.ts` - Defines all tables and their validations
- **Queries/Mutations/Actions**: `convex/*.ts` - Each file exports related functions
- **Generated types**: `convex/_generated/` - Auto-generated, do not edit manually

## Schema

Define tables with `defineTable` and validate fields with `v` from `convex/values`:

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

### Common Validations

- `v.string()` - Required string
- `v.optional(v.string())` - Optional string
- `v.id("tableName")` - ID reference to another table
- `v.number()` - Number
- `v.boolean()` - Boolean
- `v.array(v.string())` - Array of strings

### Indexes

Add indexes to optimize frequent queries:

```typescript
.index("by_board", ["boardId"])
.index("by_status", ["status"])
.index("by_created", ["createdAt"])
```

## Queries

Queries read data. They are reactive and update automatically.

```typescript
import { query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("tasks").collect();
  },
});

export const getById = query({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("boardId", args.boardId))
      .collect();
  },
});
```

### Query Patterns

**Simple query:**
```typescript
ctx.db.query("tasks").collect()
```

**Query with filter:**
```typescript
ctx.db.query("tasks").filter((q) => q.eq(q.field("status"), "done")).collect()
```

**Query with index:**
```typescript
ctx.db
  .query("tasks")
  .withIndex("by_board", (q) => q.eq("boardId", boardId))
  .collect()
```

**Query with ordering:**
```typescript
ctx.db
  .query("tasks")
  .order("desc")
  .collect()
```

## Mutations

Mutations modify data. Always validate arguments.

```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
  },
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
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    await ctx.db.patch(id, {
      ...updates,
      updatedAt: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});
```

### Database Operations

- `ctx.db.insert(table, doc)` - Insert document
- `ctx.db.patch(id, updates)` - Update specific fields
- `ctx.db.replace(id, doc)` - Replace entire document
- `ctx.db.delete(id)` - Delete document

## Actions

Actions for async operations or external calls:

```typescript
import { action } from "./_generated/server";
import { api } from "./_generated/api";

export const syncExternal = action({
  args: { data: v.string() },
  handler: async (ctx, args) => {
    // External call
    const response = await fetch("https://api.example.com/data");
    const result = await response.json();
    
    // Call mutation from action
    await ctx.runMutation(api.tasks.create, {
      title: result.title,
      status: "todo",
    });
    
    return result;
  },
});
```

## Frontend (React)

### Setup

The provider is already configured in `ConvexClientProvider.tsx`. Use hooks in client components:

```typescript
"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

export function TasksList() {
  const tasks = useQuery(api.tasks.list);
  const createTask = useMutation(api.tasks.create);
  
  if (tasks === undefined) {
    return <div>Loading...</div>;
  }
  
  return (
    <div>
      {tasks.map((task) => (
        <div key={task._id}>{task.title}</div>
      ))}
    </div>
  );
}
```

### Available Hooks

- `useQuery(api.module.function, args?)` - Reactive query
- `useMutation(api.module.function)` - Mutation function
- `useAction(api.module.function)` - Action function
- `useConvex()` - Direct Convex client

## Best Practices

1. **Always validate arguments** in mutations and actions
2. **Use indexes** for frequent queries with filters
3. **Timestamps**: Use `Date.now()` for `createdAt` and `updatedAt`
4. **Handle undefined**: In queries, check `if (data === undefined)` for loading state
5. **Descriptive names**: `getByBoard` better than `get`
6. **Separation of concerns**: One file per domain (tasks.ts, boards.ts)
7. **Data migration**: Handle legacy fields with migration logic in queries

## Common Patterns

### Legacy Data Migration

```typescript
export const list = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks.map((task) => {
      // Migrate old format to new
      if (task.text && !task.title) {
        return {
          ...task,
          title: task.text,
          status: task.isCompleted ? "done" : "todo",
        };
      }
      return task;
    });
  },
});
```

### Reference Validation

```typescript
export const create = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify board exists
    const board = await ctx.db.get(args.boardId);
    if (!board) {
      throw new Error("Board not found");
    }
    
    return await ctx.db.insert("tasks", {
      title: args.title,
      boardId: args.boardId,
    });
  },
});
```

### Partial Update

```typescript
export const update = mutation({
  args: {
    id: v.id("tasks"),
    ...updates // Optional fields
  },
  handler: async (ctx, args) => {
    const { id, ...fields } = args;
    await ctx.db.patch(id, {
      ...fields,
      updatedAt: Date.now(),
    });
  },
});
```
