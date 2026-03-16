import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

async function assertBoardAccess(ctx: QueryCtx, boardId: Id<"boards">, userId: string) {
  const board = await ctx.db.get(boardId);
  if (!board?.active) throw new Error("Board not found");
  if (board.owner_id === userId) return board;
  const member = await ctx.db
    .query("board_members")
    .withIndex("by_board_and_user", (q) => q.eq("board_id", boardId).eq("user_id", userId))
    .unique();
  if (member === null) throw new Error("Board not found");
  return board;
}

const VALID_COLORS = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "orange",
  "cyan",
  "slate",
  "indigo",
] as const;

function isValidColor(c: string): c is (typeof VALID_COLORS)[number] {
  return VALID_COLORS.includes(c as (typeof VALID_COLORS)[number]);
}

export const listByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const board = await ctx.db.get(args.boardId);
    if (!board?.active) return [];
    if (board.owner_id !== identity.subject) {
      const member = await ctx.db
        .query("board_members")
        .withIndex("by_board_and_user", (q) =>
          q.eq("board_id", args.boardId).eq("user_id", identity.subject)
        )
        .unique();
      if (member === null) return [];
    }
    const tags = await ctx.db
      .query("tags")
      .withIndex("by_board", (q) => q.eq("board_id", args.boardId))
      .collect();
    return tags.sort((a, b) => a.created_at - b.created_at);
  },
});

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    name: v.string(),
    color: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    if (!isValidColor(args.color)) {
      throw new Error("Invalid color");
    }
    const name = args.name.trim();
    if (name.length === 0) {
      throw new Error("Tag name cannot be empty");
    }
    if (name.length > 30) {
      throw new Error("Tag name too long");
    }
    const existingTags = await ctx.db
      .query("tags")
      .withIndex("by_board", (q) => q.eq("board_id", args.boardId))
      .collect();
    const nameLower = name.toLowerCase();
    if (existingTags.some((tag) => tag.name.toLowerCase() === nameLower)) {
      throw new Error("Tag name already exists");
    }
    const now = Date.now();
    return await ctx.db.insert("tags", {
      board_id: args.boardId,
      name,
      color: args.color,
      created_at: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tags"),
    name: v.optional(v.string()),
    color: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const tag = await ctx.db.get(args.id);
    if (!tag) throw new Error("Tag not found");
    await assertBoardAccess(ctx, tag.board_id, identity.subject);
    const updates: { name?: string; color?: string } = {};
    if (args.name !== undefined) {
      const name = args.name.trim();
      if (name.length === 0) {
        throw new Error("Tag name cannot be empty");
      }
      if (name.length > 30) {
        throw new Error("Tag name too long");
      }
      const existingTags = await ctx.db
        .query("tags")
        .withIndex("by_board", (q) => q.eq("board_id", tag.board_id))
        .collect();
      const nameLower = name.toLowerCase();
      if (existingTags.some((t) => t._id !== tag._id && t.name.toLowerCase() === nameLower)) {
        throw new Error("Tag name already exists");
      }
      updates.name = name;
    }
    if (args.color !== undefined) {
      if (!isValidColor(args.color)) {
        throw new Error("Invalid color");
      }
      updates.color = args.color;
    }
    if (Object.keys(updates).length > 0) {
      await ctx.db.patch(args.id, updates);
    }
  },
});

export const remove = mutation({
  args: { id: v.id("tags") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const tag = await ctx.db.get(args.id);
    if (!tag) throw new Error("Tag not found");
    await assertBoardAccess(ctx, tag.board_id, identity.subject);
    const tasksWithTag = await ctx.db
      .query("tasks")
      .filter((q) => q.eq(q.field("board_id"), tag.board_id))
      .collect();
    for (const task of tasksWithTag) {
      if (task.tags?.includes(args.id)) {
        const updatedTags = task.tags.filter((t) => t !== args.id);
        await ctx.db.patch(task._id, { tags: updatedTags.length > 0 ? updatedTags : undefined });
      }
    }
    await ctx.db.delete(args.id);
  },
});
