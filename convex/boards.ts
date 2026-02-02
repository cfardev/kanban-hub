import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

async function getBoardOrThrow(
  ctx: QueryCtx,
  boardId: Id<"boards">,
  ownerId: string
) {
  const board = await ctx.db.get(boardId);
  if (!board?.active || board.owner_id !== ownerId) {
    throw new Error("Board not found");
  }
  return board;
}

export const getById = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const board = await ctx.db.get(args.id);
    if (!board?.active || board.owner_id !== identity.subject) {
      return null;
    }
    return board;
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_owner_active", (q) =>
        q.eq("owner_id", identity.subject).eq("active", true)
      )
      .collect();
    return boards.sort((a, b) => b.created_at - a.created_at);
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const now = Date.now();
    return await ctx.db.insert("boards", {
      name: args.name,
      description: args.description,
      owner_id: identity.subject,
      created_at: now,
      updated_at: now,
      active: true,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("boards"),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await getBoardOrThrow(ctx, args.id, identity.subject);
    const { id, name, description } = args;
    const updates: { name?: string; description?: string; updated_at: number } =
      {
        updated_at: Date.now(),
      };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    await ctx.db.patch(id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await getBoardOrThrow(ctx, args.id, identity.subject);
    await ctx.db.patch(args.id, {
      active: false,
      updated_at: Date.now(),
    });
  },
});
