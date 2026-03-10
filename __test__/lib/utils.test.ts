import { describe, expect, it } from "vitest";
import { cn } from "../../src/lib/utils";

describe("cn utility function", () => {
  it("should merge class names", () => {
    const result = cn("foo", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle conditional classes", () => {
    const result = cn("foo", false && "bar", "baz");
    expect(result).toBe("foo baz");
  });

  it("should handle undefined and null", () => {
    const result = cn("foo", undefined, null, "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle empty strings", () => {
    const result = cn("foo", "", "bar");
    expect(result).toBe("foo bar");
  });

  it("should handle arrays", () => {
    const result = cn(["foo", "bar"], "baz");
    expect(result).toBe("foo bar baz");
  });

  it("should handle objects with boolean values", () => {
    const result = cn("foo", { bar: true, baz: false });
    expect(result).toBe("foo bar");
  });

  it("should handle mixed inputs", () => {
    const result = cn("foo", ["bar", "baz"], { qux: true }, false && "nope");
    expect(result).toBe("foo bar baz qux");
  });

  it("should handle tailwind-merge correctly for duplicate classes", () => {
    const result = cn("px-2 px-4", "py-1");
    expect(result).toBe("px-4 py-1");
  });
});
