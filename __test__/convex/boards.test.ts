import { describe, expect, it } from "vitest";

interface Board {
  active: boolean;
  owner_id: string;
}

interface BoardMember {
  board_id: string;
  user_id: string;
}

function hasBoardAccess(board: Board | null, userId: string, member?: BoardMember | null): boolean {
  if (!board?.active) return false;
  if (board.owner_id === userId) return true;
  return member !== null && member !== undefined;
}

function sortBoardsByDate<T extends { created_at: number }>(boards: T[]): T[] {
  return [...boards].sort((a, b) => b.created_at - a.created_at);
}

describe("hasBoardAccess", () => {
  const ownerId = "owner-123";
  const userId = "user-456";

  it("should return false for inactive board", () => {
    const board = { active: false, owner_id: ownerId };
    expect(hasBoardAccess(board, userId)).toBe(false);
  });

  it("should return false for null board", () => {
    expect(hasBoardAccess(null, userId)).toBe(false);
  });

  it("should return true for board owner", () => {
    const board = { active: true, owner_id: ownerId };
    expect(hasBoardAccess(board, ownerId)).toBe(true);
  });

  it("should return true for member", () => {
    const board = { active: true, owner_id: ownerId };
    const member = { board_id: "board-1", user_id: userId };
    expect(hasBoardAccess(board, userId, member)).toBe(true);
  });

  it("should return false for non-member on active board", () => {
    const board = { active: true, owner_id: ownerId };
    expect(hasBoardAccess(board, userId, null)).toBe(false);
    expect(hasBoardAccess(board, userId, undefined)).toBe(false);
  });
});

describe("sortBoardsByDate", () => {
  it("should sort boards by created_at descending", () => {
    const boards = [
      { _id: "1", created_at: 1000 },
      { _id: "2", created_at: 3000 },
      { _id: "3", created_at: 2000 },
    ];
    const sorted = sortBoardsByDate(boards);
    expect(sorted[0].created_at).toBe(3000);
    expect(sorted[1].created_at).toBe(2000);
    expect(sorted[2].created_at).toBe(1000);
  });

  it("should not mutate original array", () => {
    const boards = [
      { _id: "1", created_at: 1000 },
      { _id: "2", created_at: 3000 },
    ];
    sortBoardsByDate(boards);
    expect(boards[0].created_at).toBe(1000);
    expect(boards[1].created_at).toBe(3000);
  });

  it("should handle empty array", () => {
    expect(sortBoardsByDate([])).toEqual([]);
  });

  it("should handle single element array", () => {
    const boards = [{ _id: "1", created_at: 1000 }];
    const sorted = sortBoardsByDate(boards);
    expect(sorted).toHaveLength(1);
    expect(sorted[0]._id).toBe("1");
  });
});

describe("Board participant merging logic", () => {
  function mergeOwnedAndMemberBoards<T extends { _id: string; active: boolean }>(
    owned: T[],
    memberBoards: (T | null)[]
  ): T[] {
    const ownedIds = new Set(owned.map((b) => b._id));
    const merged = [
      ...owned,
      ...memberBoards.filter(
        (b): b is T => b != null && b?.active === true && !ownedIds.has(b._id)
      ),
    ];
    return merged;
  }

  it("should merge owned and member boards without duplicates", () => {
    const owned = [
      { _id: "1", active: true, name: "Board 1" },
      { _id: "2", active: true, name: "Board 2" },
    ];
    const memberBoards = [
      { _id: "2", active: true, name: "Board 2" },
      { _id: "3", active: true, name: "Board 3" },
      null,
      { _id: "4", active: false, name: "Board 4" },
    ];
    const merged = mergeOwnedAndMemberBoards(owned, memberBoards);
    expect(merged).toHaveLength(3);
    expect(merged.map((b) => b._id).sort()).toEqual(["1", "2", "3"]);
  });

  it("should exclude inactive member boards", () => {
    const owned: { _id: string; active: boolean }[] = [];
    const memberBoards = [{ _id: "1", active: false }];
    const merged = mergeOwnedAndMemberBoards(owned, memberBoards);
    expect(merged).toHaveLength(0);
  });

  it("should exclude null boards", () => {
    const owned: { _id: string; active: boolean }[] = [];
    const memberBoards: ((typeof owned)[0] | null)[] = [null, null];
    const merged = mergeOwnedAndMemberBoards(owned, memberBoards);
    expect(merged).toHaveLength(0);
  });
});
