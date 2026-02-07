"use client";

import { KanbanColumn } from "@/components/kanban-column";
import { TaskCardOverlay } from "@/components/task-card-overlay";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  type DragEndEvent,
  DragOverlay,
  type DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { useMutation } from "convex/react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";

const columnContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.03 },
  },
};

type Task = Doc<"tasks">;

const COLUMNS = ["por_empezar", "en_curso", "terminado"] as const;

export type ParticipantsInfoMap = Record<string, { name: string | null; image: string | null }>;

export function KanbanBoard({
  boardId,
  tasks,
  onTaskClick,
  onNewTask,
  participantsInfoMap = {},
}: {
  boardId: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onNewTask?: () => void;
  participantsInfoMap?: ParticipantsInfoMap;
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
        tasksInColumn.length === 0 ? 0 : Math.max(...tasksInColumn.map((t) => t.position)) + 1;
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
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        variants={columnContainerVariants}
        initial="hidden"
        animate="visible"
      >
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={tasksByStatus[status]}
            onTaskClick={onTaskClick ?? (() => {})}
            onNewTask={status === "por_empezar" ? onNewTask : undefined}
            participantsInfoMap={participantsInfoMap}
          />
        ))}
      </motion.div>
      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <TaskCardOverlay
            task={activeTask}
            assigneeInfo={
              activeTask.assignee_id
                ? {
                    _id: activeTask.assignee_id,
                    name: participantsInfoMap[activeTask.assignee_id]?.name ?? null,
                    image: participantsInfoMap[activeTask.assignee_id]?.image ?? null,
                  }
                : null
            }
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
