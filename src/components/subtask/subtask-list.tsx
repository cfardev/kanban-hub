"use client";

import { AddSubtaskForm } from "@/components/subtask/add-subtask-form";
import { SubtaskItem } from "@/components/subtask/subtask-item";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useMutation } from "convex/react";
import { List, Plus } from "lucide-react";
import { motion } from "motion/react";

type Subtask = {
  _id: string;
  title: string;
  completed: boolean;
};

const MAX_SUBTASKS = 10;

type SubtaskListProps = {
  boardId: Id<"boards">;
  taskId: Id<"tasks">;
  subtasks: Subtask[];
};

export function SubtaskList({ boardId, taskId, subtasks }: SubtaskListProps) {
  const createSubtask = useMutation(api.subtasks.create);
  const updateSubtask = useMutation(api.subtasks.update);
  const removeSubtask = useMutation(api.subtasks.remove);
  const updateSubtaskPositions = useMutation(api.subtasks.updatePositions);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const oldIndex = subtasks.findIndex((s) => s._id === active.id);
    const newIndex = subtasks.findIndex((s) => s._id === over.id);

    if (oldIndex !== newIndex) {
      const newSubtasks = [...subtasks];
      const [removed] = newSubtasks.splice(oldIndex, 1);
      newSubtasks.splice(newIndex, 0, removed);
      const subtaskIds = newSubtasks.map((s) => s._id as Id<"subtasks">);
      await updateSubtaskPositions({ taskId, subtaskIds, boardId });
    }
  };

  const handleToggleComplete = async (subtaskId: string) => {
    const subtask = subtasks.find((s) => s._id === subtaskId);
    if (!subtask) return;
    await updateSubtask({
      id: subtaskId as Id<"subtasks">,
      completed: !subtask.completed,
    });
  };

  const handleUpdateTitle = async (subtaskId: string, title: string) => {
    await updateSubtask({
      id: subtaskId as Id<"subtasks">,
      title,
    });
  };

  const handleDelete = async (subtaskId: string) => {
    await removeSubtask({
      id: subtaskId as Id<"subtasks">,
      boardId,
    });
  };

  const handleAdd = async (title: string) => {
    await createSubtask({
      boardId,
      taskId,
      title,
    });
  };

  const completedCount = subtasks.filter((s) => s.completed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <List className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Subtareas</h3>
        <span className="ml-auto text-xs text-muted-foreground">
          {completedCount}/{subtasks.length}
        </span>
      </div>

      {subtasks.length > 0 && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={subtasks.map((s) => s._id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-2">
              {subtasks.map((subtask) => (
                <SubtaskItem
                  key={subtask._id}
                  subtask={subtask}
                  isDragging={false}
                  onToggleComplete={handleToggleComplete}
                  onUpdateTitle={handleUpdateTitle}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <AddSubtaskForm
        onAdd={handleAdd}
        disabled={subtasks.length >= MAX_SUBTASKS}
        isAtLimit={subtasks.length >= MAX_SUBTASKS}
      />

      {subtasks.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center rounded-md border border-dashed p-4 text-center"
        >
          <Plus className="size-6 text-muted-foreground/50" />
          <p className="mt-2 text-sm text-muted-foreground">
            Añade subtareas para organizar mejor tu tarea
          </p>
        </motion.div>
      )}
    </div>
  );
}
