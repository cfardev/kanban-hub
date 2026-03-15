"use client";

import { useTheme } from "@/lib/theme-provider";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group relative inline-flex cursor-pointer items-center justify-center rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.97]"
      aria-label={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:rotate-180" />
      ) : (
        <Moon className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:-rotate-12" />
      )}
    </button>
  );
}
