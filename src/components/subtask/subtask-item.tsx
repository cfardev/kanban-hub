"use client";

import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { motion } from "motion/react";
import { useState } from "react";
import { LuCheck, LuGripVertical, LuTrash2 } from "react-icons/lu";

type Subtask = {
  _id: string;
  title: string;
  completed: boolean;
};

type SubtaskItemProps = {
  subtask: Subtask;
  isDragging: boolean;
  onToggleComplete: (id: string) => void;
  onUpdateTitle: (id: string, title: string) => void;
  onDelete: (id: string) => void;
};

export function SubtaskItem({
  subtask,
  isDragging,
  onToggleComplete,
  onUpdateTitle,
  onDelete,
}: SubtaskItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(subtask.title);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: subtask._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const trimmed = editValue.trim();
      if (trimmed && trimmed !== subtask.title) {
        onUpdateTitle(subtask._id, trimmed);
      }
      setIsEditing(false);
    } else if (e.key === "Escape") {
      setEditValue(subtask.title);
      setIsEditing(false);
    }
  };

  const handleBlur = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== subtask.title) {
      onUpdateTitle(subtask._id, trimmed);
    }
    setIsEditing(false);
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-2 rounded-md border bg-card px-3 py-2 transition-all",
        isDragging && "opacity-50 shadow-lg",
        subtask.completed && "bg-muted/50",
        isSortableDragging && "ring-2 ring-ring"
      )}
    >
      <button
        className="cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 focus:outline-none focus:opacity-100"
        {...attributes}
        {...listeners}
      >
        <LuGripVertical className="size-4" />
      </button>

      <button
        type="button"
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          subtask.completed
            ? "border-emerald-600 bg-emerald-600 text-white"
            : "border-muted-foreground/40 bg-transparent hover:border-emerald-600"
        )}
        onClick={() => onToggleComplete(subtask._id)}
      >
        {subtask.completed && <LuCheck className="size-3" />}
      </button>

      {isEditing ? (
        <input
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="flex-1 bg-transparent px-1 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
          maxLength={100}
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsEditing(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setIsEditing(true);
            }
          }}
          className={cn(
            "flex-1 cursor-text text-left text-sm transition-colors",
            subtask.completed && "text-muted-foreground line-through",
            !isEditing && "hover:bg-muted/50 rounded px-1"
          )}
        >
          {subtask.title}
        </button>
      )}

      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className="cursor-pointer text-muted-foreground/50 opacity-0 transition-all hover:text-destructive focus:outline-none group-hover:opacity-100"
        onClick={() => onDelete(subtask._id)}
      >
        <LuTrash2 className="size-4" />
      </motion.button>
    </div>
  );
}
