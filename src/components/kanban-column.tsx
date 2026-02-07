"use client";

import type { ParticipantsInfoMap } from "@/components/kanban-board";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import { motion } from "motion/react";

const columnVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

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
  participantsInfoMap = {},
}: {
  status: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask?: () => void;
  participantsInfoMap?: ParticipantsInfoMap;
}) {
  const droppableId = `column-${status}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const itemIds = tasks.map((t) => t._id);
  const label = COLUMN_LABELS[status] ?? status;

  return (
    <motion.div ref={setNodeRef} className="flex min-w-0 flex-1 flex-col" variants={columnVariants}>
      <Card
        className={cn("flex flex-1 flex-col transition-colors", isOver && "ring-2 ring-primary")}
      >
        <CardHeader className="py-3">
          <CardTitle className="text-sm font-medium">{label}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2 overflow-auto pb-4">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={onTaskClick}
                assigneeInfo={
                  task.assignee_id
                    ? {
                        _id: task.assignee_id,
                        name: participantsInfoMap[task.assignee_id]?.name ?? null,
                        image: participantsInfoMap[task.assignee_id]?.image ?? null,
                      }
                    : null
                }
              />
            ))}
          </SortableContext>
          {onNewTask ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 w-full cursor-pointer justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={onNewTask}
            >
              <Plus className="h-4 w-4" />
              Nueva tarea
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
