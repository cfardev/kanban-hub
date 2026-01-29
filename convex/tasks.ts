import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const list = query({
  handler: async (ctx) => {
    const tasks = await ctx.db.query("tasks").collect();
    return tasks
      .map((task) => {
        // Migrar datos legacy a nuevo formato
        if (task.text && !task.title) {
          return {
            ...task,
            title: task.text,
            status: task.isCompleted ? "done" : "todo",
            createdAt: task.createdAt || task._creationTime,
            updatedAt: task.updatedAt || task._creationTime,
          };
        }
        return {
          ...task,
          createdAt: task.createdAt || task._creationTime,
          updatedAt: task.updatedAt || task._creationTime,
        };
      })
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  },
});

export const create = mutation({
  args: {
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    boardId: v.optional(v.id("boards")),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("tasks", {
      title: args.title,
      description: args.description,
      status: args.status,
      boardId: args.boardId,
      createdAt: now,
      updatedAt: now,
    });
  },
});

export const update = mutation({
  args: {
    id: v.id("tasks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
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
