import { describe, expect, it } from "vitest";

type InvitationStatus = "pending" | "accepted" | "rejected";

interface BoardInvitation {
  board_id: string;
  inviter_id: string;
  invitee_id: string;
  status: InvitationStatus;
}

interface Board {
  active: boolean;
  owner_id: string;
}

interface BoardMember {
  board_id: string;
  user_id: string;
}

function canInviteUser(
  board: Board | null,
  inviterId: string,
  inviteeId: string,
  existingInvitation: BoardInvitation | null,
  existingMember: BoardMember | null
): { valid: boolean; error?: string } {
  if (!board?.active) {
    return { valid: false, error: "Board not found or inactive" };
  }
  if (board.owner_id !== inviterId) {
    return { valid: false, error: "Only board owner can invite" };
  }
  if (inviterId === inviteeId) {
    return { valid: false, error: "Cannot invite yourself" };
  }
  if (existingInvitation?.status === "pending") {
    return { valid: false, error: "Already has a pending invitation" };
  }
  if (existingMember) {
    return { valid: false, error: "User is already a member" };
  }
  return { valid: true };
}

function canAcceptInvitation(
  invitation: BoardInvitation | null,
  userId: string
): { valid: boolean; error?: string } {
  if (!invitation) {
    return { valid: false, error: "Invitation not found" };
  }
  if (invitation.invitee_id !== userId) {
    return { valid: false, error: "Not authorized" };
  }
  if (invitation.status !== "pending") {
    return { valid: false, error: "Invitation already processed" };
  }
  return { valid: true };
}

function canRejectInvitation(
  invitation: BoardInvitation | null,
  userId: string
): { valid: boolean; error?: string } {
  if (!invitation) {
    return { valid: false, error: "Invitation not found" };
  }
  if (invitation.invitee_id !== userId) {
    return { valid: false, error: "Not authorized" };
  }
  if (invitation.status !== "pending") {
    return { valid: false, error: "Invitation already processed" };
  }
  return { valid: true };
}

describe("canInviteUser", () => {
  const ownerId = "owner-123";
  const userId = "user-456";
  const boardId = "board-1";

  it("should allow valid invitation", () => {
    const board = { active: true, owner_id: ownerId };
    const result = canInviteUser(board, ownerId, userId, null, null);
    expect(result.valid).toBe(true);
    expect(result.error).toBeUndefined();
  });

  it("should reject inactive board", () => {
    const board = { active: false, owner_id: ownerId };
    const result = canInviteUser(board, ownerId, userId, null, null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Board not found or inactive");
  });

  it("should reject non-owner invitation", () => {
    const board = { active: true, owner_id: ownerId };
    const result = canInviteUser(board, userId, "other-user", null, null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Only board owner can invite");
  });

  it("should reject self-invitation", () => {
    const board = { active: true, owner_id: ownerId };
    const result = canInviteUser(board, ownerId, ownerId, null, null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Cannot invite yourself");
  });

  it("should reject if user already has pending invitation", () => {
    const board = { active: true, owner_id: ownerId };
    const existingInvitation = {
      board_id: boardId,
      inviter_id: ownerId,
      invitee_id: userId,
      status: "pending" as InvitationStatus,
    };
    const result = canInviteUser(board, ownerId, userId, existingInvitation, null);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Already has a pending invitation");
  });

  it("should reject if user is already a member", () => {
    const board = { active: true, owner_id: ownerId };
    const existingMember = { board_id: boardId, user_id: userId };
    const result = canInviteUser(board, ownerId, userId, null, existingMember);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("User is already a member");
  });
});

describe("canAcceptInvitation", () => {
  const userId = "user-456";
  const invitationId = "inv-1";
  const boardId = "board-1";

  it("should allow accepting valid pending invitation", () => {
    const invitation: BoardInvitation = {
      board_id: boardId,
      inviter_id: "owner-123",
      invitee_id: userId,
      status: "pending",
    };
    const result = canAcceptInvitation(invitation, userId);
    expect(result.valid).toBe(true);
  });

  it("should reject non-existent invitation", () => {
    const result = canAcceptInvitation(null, userId);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invitation not found");
  });

  it("should reject if user is not the invitee", () => {
    const invitation: BoardInvitation = {
      board_id: boardId,
      inviter_id: "owner-123",
      invitee_id: "other-user",
      status: "pending",
    };
    const result = canAcceptInvitation(invitation, userId);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Not authorized");
  });

  it("should reject if invitation is already accepted", () => {
    const invitation: BoardInvitation = {
      board_id: boardId,
      inviter_id: "owner-123",
      invitee_id: userId,
      status: "accepted",
    };
    const result = canAcceptInvitation(invitation, userId);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invitation already processed");
  });

  it("should reject if invitation is rejected", () => {
    const invitation: BoardInvitation = {
      board_id: boardId,
      inviter_id: "owner-123",
      invitee_id: userId,
      status: "rejected",
    };
    const result = canAcceptInvitation(invitation, userId);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invitation already processed");
  });
});

describe("canRejectInvitation", () => {
  const userId = "user-456";

  it("should allow rejecting valid pending invitation", () => {
    const invitation: BoardInvitation = {
      board_id: "board-1",
      inviter_id: "owner-123",
      invitee_id: userId,
      status: "pending",
    };
    const result = canRejectInvitation(invitation, userId);
    expect(result.valid).toBe(true);
  });

  it("should reject non-existent invitation", () => {
    const result = canRejectInvitation(null, userId);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Invitation not found");
  });

  it("should reject if user is not the invitee", () => {
    const invitation: BoardInvitation = {
      board_id: "board-1",
      inviter_id: "owner-123",
      invitee_id: "other-user",
      status: "pending",
    };
    const result = canRejectInvitation(invitation, userId);
    expect(result.valid).toBe(false);
    expect(result.error).toBe("Not authorized");
  });
});

describe("Invitation status validation", () => {
  it("should have valid status values", () => {
    const validStatuses: InvitationStatus[] = ["pending", "accepted", "rejected"];
    expect(validStatuses).toContain("pending");
    expect(validStatuses).toContain("accepted");
    expect(validStatuses).toContain("rejected");
  });
});
