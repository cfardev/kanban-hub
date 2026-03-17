import { describe, expect, it, vi } from "vitest";
import { formatRelativeTime } from "./format-time";

describe("formatRelativeTime", () => {
  it("returns 'ahora mismo' for less than a minute", () => {
    vi.spyOn(Date, "now").mockReturnValue(10_000);

    expect(formatRelativeTime(9_500)).toBe("ahora mismo");
  });

  it("formats minutes with singular and plural", () => {
    vi.spyOn(Date, "now").mockReturnValue(10 * 60 * 1000);

    expect(formatRelativeTime(9 * 60 * 1000)).toBe("hace 1 minuto");
    expect(formatRelativeTime(7 * 60 * 1000)).toBe("hace 3 minutos");
  });

  it("formats weeks, months and years", () => {
    const now = 365 * 24 * 60 * 60 * 1000;
    vi.spyOn(Date, "now").mockReturnValue(now);

    expect(formatRelativeTime(now - 14 * 24 * 60 * 60 * 1000)).toBe("hace 2 semanas");
    expect(formatRelativeTime(now - 45 * 24 * 60 * 60 * 1000)).toBe("hace 1 mes");
    expect(formatRelativeTime(now - 2 * 365 * 24 * 60 * 60 * 1000)).toBe("hace 2 años");
  });
});
