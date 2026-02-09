import { v } from "convex/values";
import type { Doc, Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { internalQuery, mutation, query } from "./_generated/server";

async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

async function hasBoardAccess(ctx: QueryCtx, boardId: Id<"boards">, userId: string) {
  const board = await ctx.db.get(boardId);
  if (!board?.active) return false;
  if (board.owner_id === userId) return true;
  const member = await ctx.db
    .query("board_members")
    .withIndex("by_board_and_user", (q) => q.eq("board_id", boardId).eq("user_id", userId))
    .unique();
  return member !== null;
}

async function assertBoardAccess(ctx: QueryCtx, boardId: Id<"boards">, userId: string) {
  const hasAccess = await hasBoardAccess(ctx, boardId, userId);
  if (!hasAccess) throw new Error("Board not found");
  const board = await ctx.db.get(boardId);
  if (!board) throw new Error("Board not found");
  return board;
}

async function getBoardOrThrow(ctx: QueryCtx, boardId: Id<"boards">, ownerId: string) {
  const board = await ctx.db.get(boardId);
  if (!board?.active || board.owner_id !== ownerId) {
    throw new Error("Board not found");
  }
  return board;
}

/** Returns the board only if the current user is the owner. Used by invite action. */
export const getBoardIfOwner = internalQuery({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const board = await ctx.db.get(args.id);
    if (!board?.active || board.owner_id !== identity.subject) return null;
    return board;
  },
});

export const getById = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const hasAccess = await hasBoardAccess(ctx, args.id, identity.subject);
    if (!hasAccess) return null;
    return await ctx.db.get(args.id);
  },
});

/** Returns board participant user ids (owner + members) for assignee validation/UI. */
export const listParticipants = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const hasAccess = await hasBoardAccess(ctx, args.boardId, identity.subject);
    if (!hasAccess) return [];
    const board = await ctx.db.get(args.boardId);
    if (!board?.active) return [];
    const ids = new Set<string>();
    if (board.owner_id) ids.add(board.owner_id);
    const members = await ctx.db
      .query("board_members")
      .withIndex("by_board", (q) => q.eq("board_id", args.boardId))
      .collect();
    for (const m of members) ids.add(m.user_id);
    return [...ids];
  },
});

export const list = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const owned = await ctx.db
      .query("boards")
      .withIndex("by_owner_active", (q) =>
        q.eq("owner_id", identity.subject).eq("active", true)
      )
      .collect();
    const memberRows = await ctx.db
      .query("board_members")
      .withIndex("by_user", (q) => q.eq("user_id", identity.subject))
      .collect();
    const memberBoards = await Promise.all(memberRows.map((r) => ctx.db.get(r.board_id)));
    const ownedIds = new Set(owned.map((b) => b._id));
    const merged = [
      ...owned,
      ...memberBoards.filter(
        (b): b is Doc<"boards"> => b != null && b?.active === true && !ownedIds.has(b._id)
      ),
    ];
    return merged.sort((a, b) => b.created_at - a.created_at);
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
    const updates: { name?: string; description?: string; updated_at: number } = {
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
