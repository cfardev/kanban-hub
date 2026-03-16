"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";

import { motion } from "motion/react";

type Task = Doc<"tasks">;

type AssigneeInfo = {
  _id: string;
  name: string | null;
  image: string | null;
};

type TagInfo = {
  _id: Id<"tags">;
  name: string;
  color: string;
};

function getInitials(name?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  }
  return "?";
}

const TAG_COLORS: Record<string, string> = {
  red: "bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
  blue: "bg-blue-500/10 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800",
  green:
    "bg-green-500/10 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
  yellow:
    "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",
  purple:
    "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-800",
  pink: "bg-pink-500/10 text-pink-700 dark:text-pink-400 border-pink-200 dark:border-pink-800",
  orange:
    "bg-orange-500/10 text-orange-700 dark:text-orange-400 border-orange-200 dark:border-orange-800",
  cyan: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-400 border-cyan-200 dark:border-cyan-800",
  slate:
    "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  indigo:
    "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800",
};

function getPostItColor(status: string): {
  bg: string;
  bgDark: string;
  text: string;
  border: string;
} {
  switch (status) {
    case "por_empezar":
      return {
        bg: "bg-amber-100",
        bgDark: "dark:bg-amber-950/40",
        text: "text-slate-800 dark:text-slate-200",
        border: "border-amber-300/80 dark:border-amber-700/60",
      };
    case "en_curso":
      return {
        bg: "bg-blue-100",
        bgDark: "dark:bg-blue-950/40",
        text: "text-slate-800 dark:text-slate-200",
        border: "border-blue-300/80 dark:border-blue-700/60",
      };
    case "terminado":
      return {
        bg: "bg-emerald-100",
        bgDark: "dark:bg-emerald-950/40",
        text: "text-slate-800 dark:text-slate-200",
        border: "border-emerald-300/80 dark:border-emerald-700/60",
      };
    default:
      return {
        bg: "bg-slate-100",
        bgDark: "dark:bg-slate-800/40",
        text: "text-slate-800 dark:text-slate-200",
        border: "border-slate-300/80 dark:border-slate-700/60",
      };
  }
}

export function TaskCardOverlay({
  task,
  className,
  assigneeInfo = null,
  tags = [],
}: {
  task: Task;
  className?: string;
  assigneeInfo?: AssigneeInfo | null;
  tags?: TagInfo[];
}) {
  return (
    <motion.div
      initial={{ scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0 }}
    >
      <Card className={cn("cursor-grabbing shadow-lg ring-2 ring-primary/20", className)}>
        <CardHeader className="flex flex-col gap-2 py-3 px-4">
          <div className="flex items-start gap-2">
            <CardTitle className="min-w-0 flex-1 truncate text-sm font-semibold leading-tight">
              {task.title}
            </CardTitle>
            {assigneeInfo ? (
              <Avatar className="h-6 w-6 shrink-0 border border-border">
                {assigneeInfo.image ? (
                  <AvatarImage src={assigneeInfo.image} alt={assigneeInfo.name ?? ""} />
                ) : null}
                <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                  {getInitials(assigneeInfo.name)}
                </AvatarFallback>
              </Avatar>
            ) : null}
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 -mt-1">
              {task.tags.slice(0, 3).map((tagId) => {
                const tag = tags.find((t) => t._id === tagId);
                const colorClass = TAG_COLORS[tag?.color || "slate"] || TAG_COLORS.slate;
                return tag ? (
                  <span
                    key={tag._id}
                    className={cn(
                      "inline-flex items-center rounded-md border px-1.5 py-0.5 text-[10px] font-medium",
                      colorClass
                    )}
                  >
                    <span className="truncate max-w-[100px]">{tag.name}</span>
                  </span>
                ) : null;
              })}
              {task.tags.length > 3 && (
                <span className="text-[10px] text-muted-foreground px-1 py-0.5">
                  +{task.tags.length - 3}
                </span>
              )}
            </div>
          )}
        </CardHeader>
        {task.description ? (
          <CardContent className="py-0 px-4 pb-3">
            <p className="text-muted-foreground text-xs line-clamp-2 leading-relaxed">
              {task.description}
            </p>
          </CardContent>
        ) : null}
      </Card>
    </motion.div>
  );
}
