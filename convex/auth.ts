import { components } from "./_generated/api";
import { query } from "./_generated/server";

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
