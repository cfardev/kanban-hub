import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getById = query({
  args: { id: v.id("boards") },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.id);
    return board?.active ? board : null;
  },
});

export const list = query({
  handler: async (ctx) => {
    const boards = await ctx.db
      .query("boards")
      .withIndex("by_active", (q) => q.eq("active", true))
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
    const now = Date.now();
    return await ctx.db.insert("boards", {
      name: args.name,
      description: args.description,
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
    await ctx.db.patch(args.id, {
      active: false,
      updated_at: Date.now(),
    });
  },
});
