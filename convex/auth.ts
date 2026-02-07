import { components } from "./_generated/api";
import { action, query } from "./_generated/server";
import { v } from "convex/values";

export const getCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;
    const userDoc = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "_id", value: identity.subject }],
    });
    if (!userDoc) return identity;
    return {
      ...identity,
      name: (userDoc as { name?: string }).name ?? identity.name,
      email: (userDoc as { email?: string }).email ?? identity.email,
      image: (userDoc as { image?: string | null }).image ?? (identity as { image?: string | null }).image ?? undefined,
    };
  },
});

export const requireAuth = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }
    return identity;
  },
});

/** Returns public info (name, image) for the given user ids. Used for presence avatars. */
export const getUsersPublicInfo = action({
  args: { userIds: v.array(v.string()) },
  handler: async (ctx, args) => {
    const result: { _id: string; name: string | null; image: string | null }[] = [];
    const seen = new Set<string>();
    for (const id of args.userIds) {
      if (seen.has(id)) continue;
      seen.add(id);
      const doc = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: id }],
      });
      if (doc) {
        const d = doc as { _id: string; name?: string; image?: string | null };
        result.push({
          _id: d._id,
          name: d.name ?? null,
          image: d.image ?? null,
        });
      }
    }
    return result;
  },
});
