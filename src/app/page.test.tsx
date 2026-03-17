import { beforeEach, describe, expect, it, vi } from "vitest";

const isAuthenticatedMock = vi.fn();
const redirectMock = vi.fn();

vi.mock("@/lib/auth-server", () => ({
  isAuthenticated: isAuthenticatedMock,
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    redirectMock.mockImplementation(() => {
      throw new Error("NEXT_REDIRECT");
    });
  });

  it("redirects authenticated users to dashboard", async () => {
    isAuthenticatedMock.mockResolvedValue(true);
    const { default: HomePage } = await import("./page");

    await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/dashboard");
  });

  it("redirects guests to sign-in", async () => {
    isAuthenticatedMock.mockResolvedValue(false);
    const { default: HomePage } = await import("./page");

    await expect(HomePage()).rejects.toThrow("NEXT_REDIRECT");

    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});
