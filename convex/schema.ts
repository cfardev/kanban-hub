import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  boards: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    owner_id: v.optional(v.string()),
    created_at: v.number(),
    updated_at: v.number(),
    active: v.boolean(),
  })
    .index("by_active", ["active"])
    .index("by_owner_active", ["owner_id", "active"]),

  tasks: defineTable({
    board_id: v.id("boards"),
    title: v.string(),
    description: v.optional(v.string()),
    status: v.string(),
    position: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_board", ["board_id"])
    .index("by_board_status", ["board_id", "status"]),

  // Better Auth tables are managed by the betterAuth component
  // and should not be added here to avoid duplication
});
