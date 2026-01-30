"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/task-card";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;

const COLUMN_LABELS: Record<string, string> = {
  por_empezar: "Por Empezar",
  en_curso: "En curso",
  terminado: "Terminado",
};

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onNewTask,
}: {
  status: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask?: () => void;
}) {
  const droppableId = `column-${status}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const itemIds = tasks.map((t) => t._id);
  const label = COLUMN_LABELS[status] ?? status;

  return (
    <div ref={setNodeRef} className="flex min-w-0 flex-1 flex-col">
      <Card
        className={cn(
          "flex flex-1 flex-col transition-colors",
          isOver && "ring-2 ring-primary"
        )}
      >
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2 overflow-auto pb-4">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} onClick={onTaskClick} />
            ))}
          </SortableContext>
          {onNewTask ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full justify-start gap-2 text-muted-foreground hover:text-foreground cursor-pointer"
              onClick={onNewTask}
            >
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
