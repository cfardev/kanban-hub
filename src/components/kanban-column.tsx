"use client";

import type { ParticipantsInfoMap } from "@/components/kanban-board";
import { TaskCard } from "@/components/task-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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

const COLUMN_CONFIG: Record<
  string,
  {
    label: string;
    dotClass: string;
    labelClass: string;
    badgeClass: string;
    ringClass: string;
    emptyText: string;
  }
> = {
  por_empezar: {
    label: "Por Empezar",
    dotClass: "bg-blue-500",
    labelClass: "text-blue-700 dark:text-blue-400",
    badgeClass:
      "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300",
    ringClass: "ring-blue-400/60",
    emptyText: "Arrastra o crea una tarea nueva",
  },
  en_curso: {
    label: "En Curso",
    dotClass: "bg-amber-500",
    labelClass: "text-amber-700 dark:text-amber-400",
    badgeClass:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
    ringClass: "ring-amber-400/60",
    emptyText: "Mueve tareas aquí para empezar",
  },
  terminado: {
    label: "Terminado",
    dotClass: "bg-emerald-500",
    labelClass: "text-emerald-700 dark:text-emerald-400",
    badgeClass:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
    ringClass: "ring-emerald-400/60",
    emptyText: "Las tareas completadas aparecerán aquí",
  },
};

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onNewTask,
  onMoveTask,
  participantsInfoMap = {},
  highlightDrop = false,
}: {
  status: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask?: () => void;
  onMoveTask?: (taskId: Id<"tasks">, newStatus: string) => void;
  participantsInfoMap?: ParticipantsInfoMap;
  highlightDrop?: boolean;
}) {
  const droppableId = `column-${status}`;
  const { setNodeRef, isOver } = useDroppable({ id: droppableId });
  const itemIds = tasks.map((t) => t._id);
  const config = COLUMN_CONFIG[status] ?? {
    label: status,
    dotClass: "bg-muted-foreground",
    labelClass: "text-foreground",
    badgeClass: "bg-muted text-muted-foreground",
    ringClass: "ring-primary/60",
    emptyText: "No hay tareas",
  };

  const isEmpty = tasks.length === 0;

  return (
    <motion.div
      ref={setNodeRef}
      className="flex min-w-[280px] flex-1 flex-col"
      variants={columnVariants}
    >
      <Card
        className={cn(
          "flex flex-1 flex-col transition-all duration-200",
          isOver && cn("ring-2 ring-offset-2", config.ringClass),
          highlightDrop && "ring-2 ring-emerald-500 ring-offset-2"
        )}
      >
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "h-2.5 w-2.5 shrink-0 rounded-full",
                config.dotClass
              )}
            />
            <h2 className={cn("text-sm font-semibold", config.labelClass)}>
              {config.label}
            </h2>
            <span
              className={cn(
                "ml-auto rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums",
                config.badgeClass
              )}
            >
              {tasks.length}
            </span>
          </div>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-2 overflow-auto pb-4">
          <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={onTaskClick}
                onMoveTask={onMoveTask}
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
          {isEmpty ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-1 py-8">
              <p className="text-center text-sm font-medium text-muted-foreground/60">
                {isOver ? "Suelta aquí" : config.emptyText}
              </p>
            </div>
          ) : null}
          {onNewTask ? (
            <Button
              variant="ghost"
              size="sm"
              className="mt-auto w-full cursor-pointer justify-start gap-2 text-muted-foreground hover:text-foreground"
              onClick={onNewTask}
            >
              <Plus className="h-3.5 w-3.5" />
              Nueva tarea
            </Button>
          ) : null}
        </CardContent>
      </Card>
    </motion.div>
  );
}
