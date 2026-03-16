"use client";

import { cn } from "@/lib/utils";
import { LuX } from "react-icons/lu";

export type ColorClass =
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "pink"
  | "orange"
  | "cyan"
  | "slate"
  | "indigo";

const COLOR_MAP: Record<ColorClass, { bg: string; text: string; border: string }> = {
  red: {
    bg: "bg-red-500/10",
    text: "text-red-700 dark:text-red-400",
    border: "border-red-200 dark:border-red-800",
  },
  blue: {
    bg: "bg-blue-500/10",
    text: "text-blue-700 dark:text-blue-400",
    border: "border-blue-200 dark:border-blue-800",
  },
  green: {
    bg: "bg-green-500/10",
    text: "text-green-700 dark:text-green-400",
    border: "border-green-200 dark:border-green-800",
  },
  yellow: {
    bg: "bg-yellow-500/10",
    text: "text-yellow-700 dark:text-yellow-400",
    border: "border-yellow-200 dark:border-yellow-800",
  },
  purple: {
    bg: "bg-purple-500/10",
    text: "text-purple-700 dark:text-purple-400",
    border: "border-purple-200 dark:border-purple-800",
  },
  pink: {
    bg: "bg-pink-500/10",
    text: "text-pink-700 dark:text-pink-400",
    border: "border-pink-200 dark:border-pink-800",
  },
  orange: {
    bg: "bg-orange-500/10",
    text: "text-orange-700 dark:text-orange-400",
    border: "border-orange-200 dark:border-orange-800",
  },
  cyan: {
    bg: "bg-cyan-500/10",
    text: "text-cyan-700 dark:text-cyan-400",
    border: "border-cyan-200 dark:border-cyan-800",
  },
  slate: {
    bg: "bg-slate-500/10",
    text: "text-slate-700 dark:text-slate-400",
    border: "border-slate-200 dark:border-slate-800",
  },
  indigo: {
    bg: "bg-indigo-500/10",
    text: "text-indigo-700 dark:text-indigo-400",
    border: "border-indigo-200 dark:border-indigo-800",
  },
};

export type TagBadgeProps = {
  name: string;
  color: ColorClass;
  onRemove?: () => void;
  size?: "sm" | "md";
  className?: string;
};

export function TagBadge({ name, color, onRemove, size = "md", className }: TagBadgeProps) {
  const colorClasses = COLOR_MAP[color] || COLOR_MAP.slate;
  const sizeClasses =
    size === "sm" ? "text-[10px] px-1.5 py-0.5 gap-1" : "text-xs px-2 py-1 gap-1.5";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border font-medium transition-colors",
        colorClasses.bg,
        colorClasses.text,
        colorClasses.border,
        sizeClasses,
        onRemove && "pr-1",
        className
      )}
    >
      <span className="truncate max-w-[100px]">{name}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-background/50 rounded-full p-0.5 cursor-pointer"
          aria-label={`Remove ${name} tag`}
        >
          <LuX className="h-3 w-3" />
        </button>
      )}
    </span>
  );
}
