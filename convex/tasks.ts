import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

const VALID_STATUSES = ["por_empezar", "en_curso", "terminado"] as const;

function isValidStatus(s: string): s is (typeof VALID_STATUSES)[number] {
  return VALID_STATUSES.includes(s as (typeof VALID_STATUSES)[number]);
}

export const listByBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
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
    const board = await ctx.db.get(args.boardId);
    if (!board?.active) {
      throw new Error("Board not found");
    }
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
