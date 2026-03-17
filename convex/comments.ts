import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import type { QueryCtx } from "./_generated/server";
import { mutation, query } from "./_generated/server";

const MAX_CONTENT_LENGTH = 1000;

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

async function getBoardIdFromTask(ctx: QueryCtx, taskId: Id<"tasks">) {
  const task = await getTaskOrThrow(ctx, taskId);
  return task.board_id;
}

export const listByTask = query({
  args: { boardId: v.id("boards"), taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await getTaskOrThrow(ctx, args.taskId);
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_task", (q) => q.eq("task_id", args.taskId))
      .collect();
    return comments.sort((a, b) => a.created_at - b.created_at);
  },
});

export const create = mutation({
  args: {
    boardId: v.id("boards"),
    taskId: v.id("tasks"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await getTaskOrThrow(ctx, args.taskId);
    const content = args.content.trim();
    if (content.length === 0) {
      throw new Error("Comment content cannot be empty");
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Comment content too long (max ${MAX_CONTENT_LENGTH} characters)`);
    }
    const now = Date.now();
    return await ctx.db.insert("comments", {
      task_id: args.taskId,
      author_id: identity.subject,
      content,
      created_at: now,
      updated_at: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("comments"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");
    if (comment.author_id !== identity.subject) {
      throw new Error("You can only edit your own comments");
    }
    const content = args.content.trim();
    if (content.length === 0) {
      throw new Error("Comment content cannot be empty");
    }
    if (content.length > MAX_CONTENT_LENGTH) {
      throw new Error(`Comment content too long (max ${MAX_CONTENT_LENGTH} characters)`);
    }
    await ctx.db.patch(args.id, {
      content,
      updated_at: Date.now(),
    });
  },
});

export const remove = mutation({
  args: { id: v.id("comments"), boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    const comment = await ctx.db.get(args.id);
    if (!comment) throw new Error("Comment not found");
    if (comment.author_id !== identity.subject) {
      throw new Error("You can only delete your own comments");
    }
    await assertBoardAccess(ctx, args.boardId, identity.subject);
    await ctx.db.delete(args.id);
  },
});
