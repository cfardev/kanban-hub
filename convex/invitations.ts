import { v } from "convex/values";
import { components } from "./_generated/api";
import { internal } from "./_generated/api";
import { action, internalMutation, mutation, query } from "./_generated/server";

export const create = internalMutation({
  args: {
    boardId: v.id("boards"),
    inviterId: v.string(),
    inviteeId: v.string(),
    inviterName: v.string(),
    boardName: v.string(),
  },
  handler: async (ctx, args) => {
    const board = await ctx.db.get(args.boardId);
    if (!board?.active || board.owner_id !== args.inviterId) {
      throw new Error("Board not found or you are not the owner");
    }
    const existing = await ctx.db
      .query("board_invitations")
      .withIndex("by_board_invitee", (q) =>
        q.eq("board_id", args.boardId).eq("invitee_id", args.inviteeId)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();
    if (existing) {
      throw new Error("Ya tiene una invitación pendiente");
    }
    const alreadyMember = await ctx.db
      .query("board_members")
      .withIndex("by_board_and_user", (q) =>
        q.eq("board_id", args.boardId).eq("user_id", args.inviteeId)
      )
      .unique();
    if (alreadyMember) {
      throw new Error("El usuario ya es miembro del tablero");
    }
    const now = Date.now();
    return await ctx.db.insert("board_invitations", {
      board_id: args.boardId,
      inviter_id: args.inviterId,
      invitee_id: args.inviteeId,
      inviter_name: args.inviterName,
      board_name: args.boardName,
      status: "pending",
      created_at: now,
      updated_at: now,
    });
  },
});

export const inviteByEmail = action({
  args: {
    boardId: v.id("boards"),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const board = await ctx.runQuery(internal.boards.getBoardIfOwner, {
      id: args.boardId,
    });
    if (!board) throw new Error("Board not found or you are not the owner");

    const inviteeDoc = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "email", operator: "eq", value: args.email.trim().toLowerCase() }],
    });
    if (!inviteeDoc) throw new Error("Usuario no encontrado");

    const inviteeId = (inviteeDoc as { _id: string })._id;
    if (inviteeId === identity.subject) {
      throw new Error("No puedes invitarte a ti mismo");
    }

    const inviterDoc = await ctx.runQuery(components.betterAuth.adapter.findOne, {
      model: "user",
      where: [{ field: "_id", operator: "eq", value: identity.subject }],
    });
    const inviterName =
      (inviterDoc as { name?: string } | null)?.name ?? identity.name ?? "Usuario";

    await ctx.runMutation(internal.invitations.create, {
      boardId: args.boardId,
      inviterId: identity.subject,
      inviteeId,
      inviterName,
      boardName: board.name,
    });
  },
});

export const listMine = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const list = await ctx.db
      .query("board_invitations")
      .withIndex("by_invitee_status", (q) =>
        q.eq("invitee_id", identity.subject).eq("status", "pending")
      )
      .order("desc")
      .collect();
    return list;
  },
});

export const accept = mutation({
  args: { invitationId: v.id("board_invitations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const inv = await ctx.db.get(args.invitationId);
    if (!inv || inv.invitee_id !== identity.subject || inv.status !== "pending") {
      throw new Error("Invitación no encontrada o ya procesada");
    }

    const now = Date.now();
    const existing = await ctx.db
      .query("board_members")
      .withIndex("by_board_and_user", (q) =>
        q.eq("board_id", inv.board_id).eq("user_id", identity.subject)
      )
      .unique();
    if (!existing) {
      await ctx.db.insert("board_members", {
        board_id: inv.board_id,
        user_id: identity.subject,
        created_at: now,
      });
    }
    await ctx.db.patch(args.invitationId, {
      status: "accepted",
      updated_at: now,
    });
  },
});

export const reject = mutation({
  args: { invitationId: v.id("board_invitations") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const inv = await ctx.db.get(args.invitationId);
    if (!inv || inv.invitee_id !== identity.subject || inv.status !== "pending") {
      throw new Error("Invitación no encontrada o ya procesada");
    }

    await ctx.db.patch(args.invitationId, {
      status: "rejected",
      updated_at: Date.now(),
    });
  },
});

export const listPendingForBoard = query({
  args: { boardId: v.id("boards") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];
    const board = await ctx.db.get(args.boardId);
    if (!board?.active || board.owner_id !== identity.subject) return [];
    return await ctx.db
      .query("board_invitations")
      .withIndex("by_board", (q) => q.eq("board_id", args.boardId))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .order("desc")
      .collect();
  },
});
