"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { useMutation } from "convex/react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { KanbanColumn } from "@/components/kanban-column";
import { TaskCardOverlay } from "@/components/task-card-overlay";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";

type Task = Doc<"tasks">;

const COLUMNS = ["por_empezar", "en_curso", "terminado"] as const;

export function KanbanBoard({
  boardId,
  tasks,
  onTaskClick,
  onNewTask,
}: {
  boardId: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onNewTask?: () => void;
}) {
  const [activeId, setActiveId] = useState<Id<"tasks"> | null>(null);
  const updateStatusAndPosition = useMutation(api.tasks.updateStatusAndPosition);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id as Id<"tasks">);
  }, []);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      setActiveId(null);
      if (!over) return;
      const taskId = active.id as Id<"tasks">;
      let targetStatus: string | undefined;
      if (typeof over.id === "string" && over.id.startsWith("column-")) {
        targetStatus = over.id.replace("column-", "");
      } else {
        const overTask = tasks.find((t) => t._id === over.id);
        targetStatus = overTask?.status;
      }
      if (!targetStatus || !COLUMNS.includes(targetStatus as (typeof COLUMNS)[number])) return;
      const status = targetStatus;
      const tasksInColumn = tasks.filter((t) => t.status === status);
      const newPosition =
        tasksInColumn.length === 0
          ? 0
          : Math.max(...tasksInColumn.map((t) => t.position)) + 1;
      updateStatusAndPosition({
        id: taskId,
        status,
        position: newPosition,
      });
    },
    [tasks, updateStatusAndPosition]
  );

  const tasksByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks.filter((t) => t.status === status);
      return acc;
    },
    {} as Record<(typeof COLUMNS)[number], Task[]>
  );

  const activeTask = activeId ? tasks.find((t) => t._id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid gap-4 md:grid-cols-3">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick ?? (() => { })}
            onNewTask={status === "por_empezar" ? onNewTask : undefined}
          />
        ))}
      </div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCardOverlay task={activeTask} /> : null}
      </DragOverlay>
    </DndContext>
  );
}
