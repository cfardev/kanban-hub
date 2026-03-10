import { describe, expect, it } from "vitest";

const VALID_STATUSES = ["por_empezar", "en_curso", "terminado"] as const;

function isValidStatus(s: string): s is (typeof VALID_STATUSES)[number] {
  return VALID_STATUSES.includes(s as (typeof VALID_STATUSES)[number]);
}

describe("isValidStatus", () => {
  it("should return true for valid statuses", () => {
    expect(isValidStatus("por_empezar")).toBe(true);
    expect(isValidStatus("en_curso")).toBe(true);
    expect(isValidStatus("terminado")).toBe(true);
  });

  it("should return false for invalid statuses", () => {
    expect(isValidStatus("")).toBe(false);
    expect(isValidStatus("invalid")).toBe(false);
    expect(isValidStatus("POR_EMPEZAR")).toBe(false);
    expect(isValidStatus("en curso")).toBe(false);
    expect(isValidStatus("done")).toBe(false);
  });

  it("should return false for non-string values", () => {
    expect(isValidStatus(undefined as unknown as string)).toBe(false);
    expect(isValidStatus(null as unknown as string)).toBe(false);
  });
});

describe("VALID_STATUSES constant", () => {
  it("should have 3 valid statuses", () => {
    expect(VALID_STATUSES).toHaveLength(3);
  });

  it("should contain expected status values", () => {
    expect(VALID_STATUSES).toContain("por_empezar");
    expect(VALID_STATUSES).toContain("en_curso");
    expect(VALID_STATUSES).toContain("terminado");
  });
});

describe("Task position calculation logic", () => {
  function calculatePosition(existing: { position: number }[]): number {
    return existing.length === 0 ? 0 : Math.max(...existing.map((t) => t.position)) + 1;
  }

  it("should return 0 for empty array", () => {
    expect(calculatePosition([])).toBe(0);
  });

  it("should return next position for non-empty array", () => {
    expect(calculatePosition([{ position: 0 }])).toBe(1);
    expect(calculatePosition([{ position: 0 }, { position: 1 }])).toBe(2);
    expect(calculatePosition([{ position: 5 }, { position: 10 }])).toBe(11);
  });

  it("should handle unsorted positions", () => {
    expect(calculatePosition([{ position: 10 }, { position: 2 }, { position: 5 }])).toBe(11);
  });
});
