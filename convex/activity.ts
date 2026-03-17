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

export const listByBoard = query({
  args: { boardId: v.id("boards"), limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    const logs = await ctx.db
      .query("activity_logs")
      .withIndex("by_board_created", (q) => q.eq("board_id", args.boardId))
      .order("desc")
      .collect();
    return args.limit ? logs.slice(0, args.limit) : logs;
  },
});

export const listByTask = query({
  args: { boardId: v.id("boards"), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    const logs = await ctx.db
      .query("activity_logs")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();
    return logs.sort((a, b) => b.created_at - a.created_at);
  },
});

export const logTaskCreated = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "task_created",
      details: JSON.stringify({ title: args.title }),
      created_at: Date.now(),
    });
  },
});

export const logTaskUpdated = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
    changes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "task_updated",
      details: args.changes,
      created_at: Date.now(),
    });
  },
});

export const logTaskMoved = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
    fromStatus: v.string(),
    toStatus: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "task_moved",
      details: JSON.stringify({ from: args.fromStatus, to: args.toStatus }),
      created_at: Date.now(),
    });
  },
});

export const logTaskDeleted = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "task_deleted",
      details: JSON.stringify({ title: args.title }),
      created_at: Date.now(),
    });
  },
});

export const logCommentAdded = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "comment_added",
      created_at: Date.now(),
    });
  },
});

export const logCommentEdited = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "comment_edited",
      created_at: Date.now(),
    });
  },
});

export const logCommentDeleted = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "comment_deleted",
      created_at: Date.now(),
    });
  },
});

export const logSubtaskCompleted = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
    subtaskId: v.id("subtasks"),
    title: v.string(),
    completed: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "subtask_completed",
      details: JSON.stringify({
        subtaskId: args.subtaskId,
        title: args.title,
        completed: args.completed,
      }),
      created_at: Date.now(),
    });
  },
});

export const logSubtaskDeleted = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    userId: v.string(),
    title: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("activity_logs", {
      board_id: args.boardId,
      task_id: args.taskId,
      user_id: args.userId,
      action: "subtask_deleted",
      details: JSON.stringify({ title: args.title }),
      created_at: Date.now(),
    });
  },
});
