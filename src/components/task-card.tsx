"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Doc } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

type Task = Doc<"tasks">;

export function TaskCard({
  task,
  onClick,
  className,
}: {
  task: Task;
  onClick: (task: Task) => void;
  className?: string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task._id });
  const removeTask = useMutation(api.tasks.remove);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleDelete = () => {
    if (confirm("¿Eliminar esta tarea?")) {
      removeTask({ id: task._id });
    }
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <motion.div
        whileHover={!isDragging ? { scale: 1.01 } : undefined}
        whileTap={!isDragging ? { scale: 0.99 } : undefined}
        transition={{ duration: 0.15 }}
      >
        <Card
          className={cn(
            "cursor-grab active:cursor-grabbing hover:bg-muted/25",
            isDragging && "opacity-50",
            className
          )}
          onClick={() => onClick(task)}
        >
        <CardHeader className="flex flex-row items-start gap-2 py-3">
          <CardTitle className="min-w-0 flex-1 truncate text-sm font-medium">
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0 cursor-pointer"
                onPointerDown={stopPropagation}
                onClick={stopPropagation}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={stopPropagation}>
              <DropdownMenuItem
                className="cursor-pointer"
                onClick={(e) => {
                  stopPropagation(e);
                  onClick(task);
                }}
              >
                <Pencil className="h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                className="cursor-pointer"
                onClick={(e) => {
                  stopPropagation(e);
                  handleDelete();
                }}
              >
                <Trash2 className="h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        {task.description ? (
          <CardContent className="py-0 pb-3">
            <p className="text-muted-foreground text-xs line-clamp-2">
              {task.description}
            </p>
          </CardContent>
        ) : null}
        </Card>
      </motion.div>
    </div>
  );
}
