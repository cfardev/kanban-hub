import { components } from "./_generated/api";
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const heartbeat = mutation({
  args: {
    roomId: v.string(),
    userId: v.string(),
    sessionId: v.string(),
    interval: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    if (identity.subject !== args.userId) {
      throw new Error("userId must match authenticated user");
    }
    return await ctx.runMutation(components.presence.public.heartbeat, {
      roomId: args.roomId,
      userId: args.userId,
      sessionId: args.sessionId,
      interval: args.interval,
    });
  },
});

export const list = query({
  args: {
    roomToken: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    return await ctx.runQuery(components.presence.public.list, {
      roomToken: args.roomToken,
      limit: args.limit,
    });
  },
});

export const disconnect = mutation({
  args: { sessionToken: v.string() },
  handler: async (ctx, args) => {
    return await ctx.runMutation(components.presence.public.disconnect, {
      sessionToken: args.sessionToken,
    });
  },
});
