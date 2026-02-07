import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const VALID_STATUSES = ["por_empezar", "en_curso", "terminado"] as const;

function isValidStatus(s: string): s is (typeof VALID_STATUSES)[number] {
  return VALID_STATUSES.includes(s as (typeof VALID_STATUSES)[number]);
}

async function requireIdentity(ctx: QueryCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new Error("Not authenticated");
  }
  return identity;
}

async function assertBoardAccess(
  ctx: QueryCtx,
  boardId: Id<"boards">,
  userId: string
) {
  const board = await ctx.db.get(boardId);
  if (!board?.active) throw new Error("Board not found");
  if (board.owner_id === userId) return board;
  const member = await ctx.db
    .query("board_members")
    .withIndex("by_board_and_user", (q) =>
      q.eq("board_id", boardId).eq("user_id", userId)
    )
    .unique();
  if (member === null) throw new Error("Board not found");
  return board;
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
    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_board", (q) => q.eq("board_id", args.boardId))
      .collect();
    return tasks.sort((a, b) => {
      if (a.position !== b.position) return a.position - b.position;
      return a.created_at - b.created_at;
    });
  },
});

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    if (!isValidStatus(args.status)) {
      throw new Error("Invalid status");
    }
    const identity = await requireIdentity(ctx);
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    const existing = await ctx.db
      .query("tasks")
      .withIndex("by_board_status", (q) =>
        q.eq("board_id", args.boardId).eq("status", args.status)
      )
      .collect();
    const position =
      existing.length === 0
        ? 0
        : Math.max(...existing.map((t) => t.position)) + 1;
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      board_id: args.boardId,
      title: args.title,
      description: args.description,
      status: args.status,
      position,
      created_at: now,
      updated_at: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { id, ...updates } = args;
    if (updates.status !== undefined && !isValidStatus(updates.status)) {
      throw new Error("Invalid status");
    }
    const identity = await requireIdentity(ctx);
    const task = await ctx.db.get(id);
    if (!task) throw new Error("Task not found");
    await assertBoardAccess(ctx, task.board_id, identity.subject);
    const patch: {
      title?: string;
      description?: string;
      status?: string;
      position?: number;
      updated_at: number;
    } = { updated_at: Date.now() };
    if (updates.title !== undefined) patch.title = updates.title;
    if (updates.description !== undefined) patch.description = updates.description;
    if (updates.status !== undefined) patch.status = updates.status;
    if (updates.position !== undefined) patch.position = updates.position;
    await ctx.db.patch(id, patch);
  },
});

export const updateStatusAndPosition = mutation({
  args: {
    id: v.id("tasks"),
    status: v.string(),
    position: v.number(),
  },
  handler: async (ctx, args) => {
    if (!isValidStatus(args.status)) {
      throw new Error("Invalid status");
    }
    const identity = await requireIdentity(ctx);
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    await assertBoardAccess(ctx, task.board_id, identity.subject);
    await ctx.db.patch(args.id, {
      status: args.status,
      position: args.position,
      updated_at: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const task = await ctx.db.get(args.id);
    if (!task) throw new Error("Task not found");
    await assertBoardAccess(ctx, task.board_id, identity.subject);
    await ctx.db.delete(args.id);
  },
});

/** One-off: delete tasks that don't match the new schema (missing board_id). Run once from Convex dashboard if you see schema validation errors. */
export const deleteLegacyTasks = mutation({
  args: {},
  handler: async (ctx) => {
    const all = await ctx.db.query("tasks").collect();
    let deleted = 0;
    for (const doc of all) {
      if (!("board_id" in doc) || doc.board_id === undefined) {
        await ctx.db.delete(doc._id);
        deleted++;
      }
    }
    return { deleted };
  },
});
