import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  tasks: defineTable({
    // Nuevos campos
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.string()), // "todo" | "in-progress" | "done"
    boardId: v.optional(v.id("boards")),
    createdAt: v.optional(v.number()),
    updatedAt: v.optional(v.number()),
    // Campos legacy (para compatibilidad con datos existentes)
    text: v.optional(v.string()),
    isCompleted: v.optional(v.boolean()),
  }).index("by_board", ["boardId"]),

  boards: defineTable({
    name: v.string(),
    description: v.optional(v.string()),
    createdAt: v.optional(v.number()),
  }),
});
