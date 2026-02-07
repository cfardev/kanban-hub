"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";

type Task = Doc<"tasks">;

type AssigneeInfo = {
  _id: string;
  name: string | null;
  image: string | null;
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

export function TaskCardOverlay({
  task,
  className,
  assigneeInfo = null,
}: {
  task: Task;
  className?: string;
  assigneeInfo?: AssigneeInfo | null;
}) {
  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0.9 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card className={cn("cursor-grabbing shadow-lg ring-2 ring-primary/20 rotate-2", className)}>
        <CardHeader className="flex flex-row items-start gap-2 py-3">
          <CardTitle className="min-w-0 flex-1 truncate text-sm font-medium">
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
        </CardHeader>
        {task.description ? (
          <CardContent className="py-0 pb-3">
            <p className="text-muted-foreground text-xs line-clamp-2">{task.description}</p>
          </CardContent>
        ) : null}
      </Card>
    </motion.div>
  );
}
