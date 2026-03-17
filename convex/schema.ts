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
    assignee_id: v.optional(v.string()),
    tags: v.optional(v.array(v.id("tags"))),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_board", ["board_id"])
    .index("by_board_status", ["board_id", "status"]),
  tags: defineTable({
    board_id: v.id("boards"),
    name: v.string(),
    color: v.string(),
    created_at: v.number(),
  }).index("by_board", ["board_id"]),

  board_members: defineTable({
    board_id: v.id("boards"),
    user_id: v.string(),
    created_at: v.number(),
  })
    .index("by_board", ["board_id"])
    .index("by_user", ["user_id"])
    .index("by_board_and_user", ["board_id", "user_id"]),

  board_invitations: defineTable({
    board_id: v.id("boards"),
    inviter_id: v.string(),
    invitee_id: v.string(),
    inviter_name: v.string(),
    board_name: v.string(),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("rejected")),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_invitee_status", ["invitee_id", "status"])
    .index("by_board", ["board_id"])
    .index("by_board_invitee", ["board_id", "invitee_id"]),

  subtasks: defineTable({
    task_id: v.id("tasks"),
    title: v.string(),
    completed: v.boolean(),
    position: v.number(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_task", ["task_id"]),

  comments: defineTable({
    task_id: v.id("tasks"),
    author_id: v.string(),
    content: v.string(),
    created_at: v.number(),
    updated_at: v.number(),
  })
    .index("by_task", ["task_id"])
    .index("by_task_created", ["task_id", "created_at"]),

  activity_logs: defineTable({
    board_id: v.id("boards"),
    task_id: v.optional(v.id("tasks")),
    user_id: v.string(),
    action: v.string(),
    details: v.optional(v.string()),
    created_at: v.number(),
  })
    .index("by_board", ["board_id"])
    .index("by_board_created", ["board_id", "created_at"])
    .index("by_task", ["task_id"]),

  // Better Auth tables are managed by the betterAuth component
  // and should not be added here to avoid duplication
});
