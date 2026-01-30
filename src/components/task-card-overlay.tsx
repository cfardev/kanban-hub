"use client";

import type { Doc } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  );
}
