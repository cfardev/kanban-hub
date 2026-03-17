import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const MAX_SUBTASKS_PER_TASK = 10;
const MAX_TITLE_LENGTH = 100;

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

async function getTaskOrThrow(ctx: QueryCtx, taskId: Id<"tasks">) {
  const task = await ctx.db.get(taskId);
  if (!task) throw new Error("Task not found");
  return task;
}

export const listByTask = query({
  args: { boardId: v.id("boards"), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await getTaskOrThrow(ctx, args.taskId);
    const subtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();
    return subtasks.sort((a, b) => a.position - b.position);
  },
});

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await getTaskOrThrow(ctx, args.taskId);
    const title = args.title.trim();
    if (title.length === 0) {
      throw new Error("Subtask title cannot be empty");
    }
    if (title.length > MAX_TITLE_LENGTH) {
      throw new Error(`Subtask title too long (max ${MAX_TITLE_LENGTH} characters)`);
    }
    const existingSubtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();
    if (existingSubtasks.length >= MAX_SUBTASKS_PER_TASK) {
      throw new Error(`Maximum ${MAX_SUBTASKS_PER_TASK} subtasks allowed per task`);
    }
    const position =
      existingSubtasks.length === 0 ? 0 : Math.max(...existingSubtasks.map((s) => s.position)) + 1;
    const now = Date.now();
    return await ctx.db.insert("subtasks", {
      task_id: args.taskId,
      title,
      completed: false,
      position,
      created_at: now,
      updated_at: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("subtasks"),
    title: v.optional(v.string()),
    completed: v.optional(v.boolean()),
    position: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const subtask = await ctx.db.get(args.id);
    if (!subtask) throw new Error("Subtask not found");
    const task = await getTaskOrThrow(ctx, subtask.task_id);
    const board = await ctx.db.get(task.board_id);
    if (!board?.active) throw new Error("Board not found");
    if (board.owner_id !== identity.subject) {
      const member = await ctx.db
        .query("board_members")
        .withIndex("by_board_and_user", (q) =>
          q.eq("board_id", board._id).eq("user_id", identity.subject)
        )
        .unique();
      if (member === null) throw new Error("Board not found");
    }
    const updates: {
      title?: string;
      completed?: boolean;
      position?: number;
      updated_at: number;
    } = { updated_at: Date.now() };
    if (args.title !== undefined) {
      const title = args.title.trim();
      if (title.length === 0) {
        throw new Error("Subtask title cannot be empty");
      }
      if (title.length > MAX_TITLE_LENGTH) {
        throw new Error(`Subtask title too long (max ${MAX_TITLE_LENGTH} characters)`);
      }
      updates.title = title;
    }
    if (args.completed !== undefined) {
      updates.completed = args.completed;
    }
    if (args.position !== undefined) {
      updates.position = args.position;
    }
    await ctx.db.patch(args.id, updates);
  },
});

export const remove = mutation({
  args: { id: v.id("subtasks"), boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const subtask = await ctx.db.get(args.id);
    if (!subtask) throw new Error("Subtask not found");
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await ctx.db.delete(args.id);
  },
});

export const updatePositions = mutation({
  args: {
    taskId: v.id("tasks"),
    subtaskIds: v.array(v.id("subtasks")),
    boardId: v.id("boards"),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await getTaskOrThrow(ctx, args.taskId);
    const existingSubtasks = await ctx.db
      .query("subtasks")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();
    const existingSet = new Set(existingSubtasks.map((s) => s._id.toString()));
    const newSet = new Set(args.subtaskIds.map((id) => id.toString()));
    if (existingSet.size !== newSet.size || !args.subtaskIds.every((id) => existingSet.has(id))) {
      throw new Error("Subtask IDs do not match");
    }
    for (let i = 0; i < args.subtaskIds.length; i++) {
      const subtaskId = args.subtaskIds[i];
      await ctx.db.patch(subtaskId, {
        position: i,
        updated_at: Date.now(),
      });
    }
  },
});
