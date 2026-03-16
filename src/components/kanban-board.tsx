"use client";

import { KanbanColumn } from "@/components/kanban-column";
import { TaskCardOverlay } from "@/components/task-card-overlay";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from "@dnd-kit/core";
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
type Tag = Doc<"tags">;

const COLUMNS = ["por_empezar", "en_curso", "terminado"] as const;

export type ParticipantsInfoMap = Record<string, { name: string | null; image: string | null }>;

// Keeps the overlay anchored to where the user grabbed the card
const keepOriginModifier: Modifier = ({ activatorEvent, draggingNodeRect, transform }) => {
  if (draggingNodeRect && activatorEvent) {
    const { pageX, pageY } = activatorEvent as PointerEvent;
    const offsetX = pageX - draggingNodeRect.left;
    const offsetY = pageY - draggingNodeRect.top;
    return {
      ...transform,
      x: transform.x - (draggingNodeRect.width / 2 - offsetX),
      y: transform.y - (draggingNodeRect.height / 2 - offsetY),
    };
  }
  return transform;
};

export function KanbanBoard({
  boardId,
  tasks,
  onTaskClick,
  onNewTask,
  participantsInfoMap = {},
  tags = [],
}: {
  boardId: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onNewTask?: () => void;
  participantsInfoMap?: ParticipantsInfoMap;
  tags?: Tag[];
}) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const updateStatusAndPosition = useMutation(api.tasks.updateStatusAndPosition);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } })
  );

  const handleDragStart = useCallback(
    (event: DragStartEvent) => {
      const task = tasks.find((t) => t._id === event.active.id);
      setActiveTask(task ?? null);
    },
    [tasks]
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setActiveTask(null);
      const { active, over } = event;
      if (!over) return;

      const taskId = active.id as Id<"tasks">;
      const overId = over.id as string;

      // Determine target column and position
      const targetStatus = COLUMNS.includes(overId as (typeof COLUMNS)[number])
        ? (overId as (typeof COLUMNS)[number])
        : (tasks.find((t) => t._id === overId)?.status as (typeof COLUMNS)[number] | undefined);

      if (!targetStatus) return;

      const tasksInTarget = tasks
        .filter((t) => t.status === targetStatus && t._id !== taskId)
        .sort((a, b) => a.position - b.position);

      let newPosition: number;

      if (COLUMNS.includes(overId as (typeof COLUMNS)[number])) {
        // Dropped on column itself — put at end
        newPosition =
          tasksInTarget.length === 0 ? 0 : tasksInTarget[tasksInTarget.length - 1].position + 1;
      } else {
        // Dropped on another task — insert before it
        const overIndex = tasksInTarget.findIndex((t) => t._id === overId);
        const prev = tasksInTarget[overIndex - 1];
        const next = tasksInTarget[overIndex];

        if (!prev && !next) {
          newPosition = 0;
        } else if (!prev) {
          newPosition = next.position - 1;
        } else if (!next) {
          newPosition = prev.position + 1;
        } else {
          newPosition = (prev.position + next.position) / 2;
        }
      }

      const currentTask = tasks.find((t) => t._id === taskId);
      if (
        currentTask?.status === targetStatus &&
        Math.abs((currentTask?.position ?? 0) - newPosition) < 0.0001
      )
        return;

      updateStatusAndPosition({ id: taskId, status: targetStatus, position: newPosition });
    },
    [tasks, updateStatusAndPosition]
  );

  const tasksByStatus = COLUMNS.reduce(
    (acc, status) => {
      acc[status] = tasks
        .filter((t) => t.status === status)
        .sort((a, b) => a.position - b.position);
      return acc;
    },
    {} as Record<(typeof COLUMNS)[number], Task[]>
  );

  const activeAssignee = activeTask?.assignee_id
    ? {
      _id: activeTask.assignee_id,
      name: participantsInfoMap[activeTask.assignee_id]?.name ?? null,
      image: participantsInfoMap[activeTask.assignee_id]?.image ?? null,
    }
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      modifiers={[keepOriginModifier]}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        className="overflow-x-auto pb-2"
        variants={columnContainerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex min-h-0 gap-4 md:grid md:grid-cols-3 md:overflow-visible">
          {COLUMNS.map((status) => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksByStatus[status]}
              onTaskClick={onTaskClick ?? (() => { })}
              onNewTask={status === "por_empezar" ? onNewTask : undefined}
              participantsInfoMap={participantsInfoMap}
              activeTaskId={activeTask?._id ?? null}
              tags={tags}
            />
          ))}
        </div>
      </motion.div>
      <DragOverlay>
        {activeTask ? (
          <TaskCardOverlay
            task={activeTask}
            assigneeInfo={activeAssignee}
            tags={tags}
          />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
