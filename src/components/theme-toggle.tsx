"use client";

import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="flex w-full cursor-pointer items-center rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-muted focus:outline-none"
    >
      {theme === "dark" ? (
        <>
          <Sun className="mr-3 h-4 w-4 shrink-0" />
          Claro
        </>
      ) : (
        <>
          <Moon className="mr-3 h-4 w-4 shrink-0" />
          Oscuro
        </>
      )}
    </button>
  );
}
