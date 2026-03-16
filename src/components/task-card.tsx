"use client";

import { type ColorClass, TagBadge } from "@/components/tag-badge";
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
import { STATUS_OPTIONS, type TaskStatus } from "@/lib/task-status";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { ArrowLeft, ArrowRight, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { Draggable } from "react-beautiful-dnd";

type Task = Doc<"tasks">;

type AssigneeInfo = {
  _id: string;
  name: string | null;
  image: string | null;
};

type TagInfo = {
  _id: Id<"tags">;
  name: string;
  color: ColorClass | string;
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

function getAdjacentStatuses(status: TaskStatus) {
  const currentIndex = STATUS_OPTIONS.findIndex((option) => option.value === status);

  return {
    previous: currentIndex > 0 ? STATUS_OPTIONS[currentIndex - 1] : null,
    next:
      currentIndex >= 0 && currentIndex < STATUS_OPTIONS.length - 1
        ? STATUS_OPTIONS[currentIndex + 1]
        : null,
  };
}

function getPostItColor(status: string): {
  bg: string;
  text: string;
  border: string;
  accent: string;
} {
  switch (status) {
    case "por_empezar":
      return {
        bg: "bg-card/95",
        text: "text-foreground",
        border: "border-border/80",
        accent: "before:bg-sky-500/75",
      };
    case "en_curso":
      return {
        bg: "bg-card/95",
        text: "text-foreground",
        border: "border-border/80",
        accent: "before:bg-amber-500/75",
      };
    case "terminado":
      return {
        bg: "bg-card/95",
        text: "text-foreground",
        border: "border-border/80",
        accent: "before:bg-emerald-500/75",
      };
    default:
      return {
        bg: "bg-card/95",
        text: "text-foreground",
        border: "border-border/80",
        accent: "before:bg-muted-foreground/45",
      };
  }
}

export function TaskCard({
  task,
  index,
  onClick,
  className,
  assigneeInfo = null,
  onMoveTask,
  tags = [],
}: {
  task: Task;
  index: number;
  onClick: (task: Task) => void;
  className?: string;
  assigneeInfo?: AssigneeInfo | null;
  onMoveTask?: (taskId: Id<"tasks">, newStatus: string) => void;
  tags?: TagInfo[];
}) {
  const removeTask = useMutation(api.tasks.remove);

  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const currentStatus = task.status as TaskStatus;
  const { previous, next } = getAdjacentStatuses(currentStatus);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    removeTask({ id: task._id });
    setDeleteConfirmOpen(false);
  };

  const postItColor = getPostItColor(task.status);

  return (
    <>
      <Draggable draggableId={task._id} index={index}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            style={provided.draggableProps.style}
          >
            <motion.div
              whileHover={!snapshot.isDragging ? { scale: 1.01 } : undefined}
              whileTap={!snapshot.isDragging ? { scale: 0.99 } : undefined}
              transition={{ duration: 0.15 }}
            >
              <div
                className={cn(
                  "relative cursor-pointer rounded-lg border p-3 pl-4 transition-all duration-200 before:absolute before:inset-y-2 before:left-1.5 before:w-0.5 before:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring/60",
                  postItColor.bg,
                  postItColor.text,
                  postItColor.border,
                  postItColor.accent,
                  snapshot.isDragging && "opacity-50",
                  className
                )}
                tabIndex={0}
                role="button"
                aria-label={task.title ? `Abrir ${task.title}` : "Abrir nota"}
                onClick={() => onClick(task)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    onClick(task);
                  }
                }}
              >
                <div className="flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <h3 className="min-w-0 flex-1 text-sm leading-snug font-semibold tracking-tight">
                      {task.title}
                    </h3>
                    <div className="flex items-center gap-1 shrink-0">
                      {assigneeInfo ? (
                        <div
                          className="shrink-0 cursor-pointer"
                          title={assigneeInfo.name ?? assigneeInfo._id}
                        >
                          <Avatar className="h-6 w-6 border border-border/70">
                            {assigneeInfo.image ? (
                              <AvatarImage src={assigneeInfo.image} alt={assigneeInfo.name ?? ""} />
                            ) : null}
                            <AvatarFallback className="bg-muted text-foreground text-[10px] font-medium">
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
                            className="h-7 w-7 shrink-0 cursor-pointer text-muted-foreground hover:bg-muted/70 hover:text-foreground"
                            onPointerDown={stopPropagation}
                            onClick={stopPropagation}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          onClick={stopPropagation}
                          className="cursor-pointer"
                        >
                          <DropdownMenuItem
                            className="cursor-pointer"
                            onClick={(e) => {
                              stopPropagation(e);
                              onClick(task);
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          {onMoveTask ? (
                            <DropdownMenuSub>
                              <DropdownMenuSubTrigger className="cursor-pointer">
                                <ArrowRight className="h-4 w-4 mr-2" />
                                Mover a
                              </DropdownMenuSubTrigger>
                              <DropdownMenuSubContent>
                                {STATUS_OPTIONS.map(({ value, label }) =>
                                  task.status === value ? null : (
                                    <DropdownMenuItem
                                      key={value}
                                      className="cursor-pointer"
                                      onClick={(e) => {
                                        stopPropagation(e);
                                        onMoveTask(task._id, value);
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
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  {task.tags && task.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 -mt-0.5">
                      {task.tags.slice(0, 3).map((tagId) => {
                        const tag = tags.find((t) => t._id === tagId);
                        return tag ? (
                          <TagBadge
                            key={tag._id}
                            name={tag.name}
                            color={tag.color as ColorClass}
                            size="sm"
                          />
                        ) : null;
                      })}
                      {task.tags.length > 3 && (
                        <span className="text-[10px] opacity-60 px-1 py-0.5 font-medium">
                          +{task.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                {task.description ? (
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {task.description}
                  </p>
                ) : null}
                {onMoveTask ? (
                  <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/40">
                    {previous ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 cursor-pointer rounded-full px-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        onPointerDown={stopPropagation}
                        onClick={(e) => {
                          stopPropagation(e);
                          onMoveTask(task._id, previous.value);
                        }}
                      >
                        <ArrowLeft className="mr-1 size-2.5" />
                        {previous.label}
                      </Button>
                    ) : null}
                    {next ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 cursor-pointer rounded-full px-2 text-[10px] text-muted-foreground hover:text-foreground hover:bg-muted/40"
                        onPointerDown={stopPropagation}
                        onClick={(e) => {
                          stopPropagation(e);
                          onMoveTask(task._id, next.value);
                        }}
                      >
                        {next.label}
                        <ArrowRight className="ml-1 size-2.5" />
                      </Button>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </motion.div>
          </div>
        )}
      </Draggable>
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
