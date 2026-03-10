import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { afterEach, vi } from "vitest";

afterEach(() => {
  cleanup();
});

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  usePathname: () => "/",
}));

vi.mock("@/convex/react", () => ({
  useMutation: () => vi.fn(),
  useQuery: () => null,
}));

window.scrollTo = vi.fn();
