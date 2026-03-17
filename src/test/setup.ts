import "@testing-library/jest-dom/vitest";
import React from "react";
import { vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) =>
    React.createElement("a", { href: typeof href === "string" ? href : "", ...props }, children),
}));

vi.mock("next/image", () => ({
  default: ({ alt = "", ...props }: React.ImgHTMLAttributes<HTMLImageElement>) =>
    React.createElement("img", { alt, ...props }),
}));

vi.mock("motion/react", () => {
  const createMotionTag = (tag: string) => {
    return ({ children, ...props }: React.HTMLAttributes<HTMLElement>) =>
      React.createElement(tag, props, children);
  };

  const motion = new Proxy(
    {},
    {
      get: (_target, key) => createMotionTag(String(key)),
    }
  ) as Record<string, React.ComponentType<React.HTMLAttributes<HTMLElement>>>;

  return {
    motion,
    AnimatePresence: ({ children }: { children: React.ReactNode }) =>
      React.createElement(React.Fragment, null, children),
  };
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
