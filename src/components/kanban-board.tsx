"use client";

import { KanbanColumn } from "@/components/kanban-column";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { motion } from "motion/react";
import { useCallback, useState } from "react";
import { DragDropContext, type DropResult } from "react-beautiful-dnd";

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

export function KanbanBoard({
  boardId,
  tasks,
  onTaskClick,
  onNewTask,
  onMoveTask,
  participantsInfoMap = {},
  tags = [],
}: {
  boardId: string;
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
  onNewTask?: () => void;
  onMoveTask?: (taskId: Id<"tasks">, newStatus: string) => void;
  participantsInfoMap?: ParticipantsInfoMap;
  tags?: Tag[];
}) {
  const [lastDroppedColumn, setLastDroppedColumn] = useState<string | null>(null);
  const updateStatusAndPosition = useMutation(api.tasks.updateStatusAndPosition);

  const handleDragEnd = useCallback(
    (result: DropResult) => {
      const { destination, draggableId } = result;
      if (!destination) return;
      const taskId = draggableId as Id<"tasks">;
      const targetStatus = destination.droppableId;
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
      setLastDroppedColumn(status);
      setTimeout(() => setLastDroppedColumn(null), 1500);
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

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
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
              onTaskClick={onTaskClick ?? (() => {})}
              onNewTask={status === "por_empezar" ? onNewTask : undefined}
              onMoveTask={onMoveTask}
              participantsInfoMap={participantsInfoMap}
              highlightDrop={lastDroppedColumn === status}
              tags={tags}
            />
          ))}
        </div>
      </motion.div>
    </DragDropContext>
  );
}
