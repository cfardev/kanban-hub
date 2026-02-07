"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;

export function TaskCardOverlay({
  task,
  className,
}: {
  task: Task;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ scale: 0.96, opacity: 0.9 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      <Card
        className={cn(
          "cursor-grabbing shadow-lg ring-2 ring-primary/20 rotate-2",
          className
        )}
      >
      <CardHeader className="py-3">
        <CardTitle className="text-sm font-medium truncate">
          {task.title}
        </CardTitle>
      </CardHeader>
      {task.description ? (
        <CardContent className="py-0 pb-3">
          <p className="text-muted-foreground text-xs line-clamp-2">
            {task.description}
          </p>
        </CardContent>
      ) : null}
      </Card>
    </motion.div>
  );
}
