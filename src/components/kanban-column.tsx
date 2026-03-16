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
type Tag = Doc<"tags">;

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
    dotClass: "bg-sky-500/80",
    labelClass: "text-foreground",
    badgeClass: "bg-sky-500/12 text-sky-700 dark:text-sky-300",
    ringClass: "ring-sky-400/45",
    emptyText: "Arrastra o crea una tarea nueva",
  },
  en_curso: {
    label: "En Curso",
    dotClass: "bg-amber-500/85",
    labelClass: "text-foreground",
    badgeClass: "bg-amber-500/12 text-amber-700 dark:text-amber-300",
    ringClass: "ring-amber-400/45",
    emptyText: "Mueve tareas aquí para empezar",
  },
  terminado: {
    label: "Terminado",
    dotClass: "bg-emerald-500/85",
    labelClass: "text-foreground",
    badgeClass: "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300",
    ringClass: "ring-emerald-400/45",
    emptyText: "Las tareas completadas aparecerán aquí",
  },
};

export function KanbanColumn({
  status,
  tasks,
  onTaskClick,
  onNewTask,
  participantsInfoMap = {},
  activeTaskId = null,
  tags = [],
}: {
  status: string;
  tasks: Task[];
  onTaskClick: (task: Task) => void;
  onNewTask?: () => void;
  participantsInfoMap?: ParticipantsInfoMap;
  activeTaskId?: Id<"tasks"> | null;
  tags?: Tag[];
}) {
  const config = COLUMN_CONFIG[status] ?? {
    label: status,
    dotClass: "bg-muted-foreground",
    labelClass: "text-foreground",
    badgeClass: "bg-muted text-muted-foreground",
    ringClass: "ring-primary/60",
    emptyText: "No hay tareas",
  };

  const { setNodeRef, isOver } = useDroppable({ id: status });
  const taskIds = tasks.map((t) => t._id);
  const isEmpty = tasks.length === 0;

  return (
    <motion.div className="flex min-w-[280px] flex-1 flex-col" variants={columnVariants}>
      <Card
        className={cn(
          "flex flex-1 flex-col border-border/80 bg-background/55 transition-all duration-200",
          isOver && cn("ring-2 ring-offset-2", config.ringClass)
        )}
      >
        <CardHeader className="pb-2 pt-3">
          <div className="flex items-center gap-2">
            <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", config.dotClass)} />
            <h2 className={cn("text-sm font-semibold tracking-tight", config.labelClass)}>
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
        <CardContent
          ref={setNodeRef}
          className="flex flex-1 flex-col gap-2 overflow-auto pb-4"
        >
          <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onClick={onTaskClick}
                isDragging={activeTaskId === task._id}
                assigneeInfo={
                  task.assignee_id
                    ? {
                      _id: task.assignee_id,
                      name: participantsInfoMap[task.assignee_id]?.name ?? null,
                      image: participantsInfoMap[task.assignee_id]?.image ?? null,
                    }
                    : null
                }
                tags={tags}
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
