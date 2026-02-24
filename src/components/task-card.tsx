"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";
import { ArrowRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

type Task = Doc<"tasks">;

type AssigneeInfo = {
  _id: string;
  name: string | null;
  image: string | null;
};

function getInitials(name?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  }
  return "?";
}

const MOVE_COLUMNS: { status: string; label: string }[] = [
  { status: "por_empezar", label: "Por Empezar" },
  { status: "en_curso", label: "En curso" },
  { status: "terminado", label: "Terminado" },
];


export function TaskCard({
  task,
  onClick,
  className,
  assigneeInfo = null,
  onMoveTask,
}: {
  task: Task;
  onClick: (task: Task) => void;
  className?: string;
  assigneeInfo?: AssigneeInfo | null;
  onMoveTask?: (taskId: Id<"tasks">, newStatus: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task._id,
  });
  const removeTask = useMutation(api.tasks.remove);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    removeTask({ id: task._id });
    setDeleteConfirmOpen(false);
  };

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
        <motion.div
          whileHover={!isDragging ? { scale: 1.01 } : undefined}
          whileTap={!isDragging ? { scale: 0.99 } : undefined}
          transition={{ duration: 0.15 }}
        >
          <Card
            className={cn(
              "cursor-pointer active:cursor-grabbing hover:bg-muted/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isDragging && "opacity-50",
              className
            )}
            tabIndex={0}
            role="button"
            aria-label={task.title ? `Abrir ${task.title}` : "Abrir tarea"}
            onClick={() => onClick(task)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onClick(task);
              }
            }}
          >
            <CardHeader className="flex flex-row items-start gap-2 py-3">
              <CardTitle className="min-w-0 flex-1 truncate text-sm font-medium">
                {task.title}
              </CardTitle>
              {assigneeInfo ? (
                <div
                  className="shrink-0 cursor-pointer"
                  title={assigneeInfo.name ?? assigneeInfo._id}
                >
                  <Avatar className="h-6 w-6 border border-border">
                    {assigneeInfo.image ? (
                      <AvatarImage src={assigneeInfo.image} alt={assigneeInfo.name ?? ""} />
                    ) : null}
                    <AvatarFallback className="bg-muted text-muted-foreground text-[10px]">
                      {getInitials(assigneeInfo.name)}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ) : null}
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
                  {onMoveTask ? (
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger className="cursor-pointer">
                        <ArrowRight className="h-4 w-4" />
                        Mover a
                      </DropdownMenuSubTrigger>
                      <DropdownMenuSubContent>
                        {MOVE_COLUMNS.map(({ status, label }) =>
                          task.status === status ? null : (
                            <DropdownMenuItem
                              key={status}
                              className="cursor-pointer"
                              onClick={(e) => {
                                stopPropagation(e);
                                onMoveTask(task._id, status);
                              }}
                            >
                              {label}
                            </DropdownMenuItem>
                          )
                        )}
                      </DropdownMenuSubContent>
                    </DropdownMenuSub>
                  ) : null}
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer"
                    onClick={(e) => {
                      stopPropagation(e);
                      handleDeleteClick();
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
                <p className="text-muted-foreground text-xs line-clamp-2">{task.description}</p>
              </CardContent>
            ) : null}
          </Card>
        </motion.div>
      </div>
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta tarea?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive/20"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
