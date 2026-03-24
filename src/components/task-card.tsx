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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMutation } from "convex/react";
import { MessageSquare, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

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
  onClick,
  className,
  assigneeInfo = null,
  isDragging = false,
  tags = [],
  commentsCount = 0,
}: {
  task: Task;
  onClick: (task: Task) => void;
  className?: string;
  assigneeInfo?: AssigneeInfo | null;
  isDragging?: boolean;
  tags?: TagInfo[];
  commentsCount?: number;
}) {
  const removeTask = useMutation(api.tasks.remove);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: task._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  const postItColor = getPostItColor(task.status);
  const isBeingDragged = isDragging || isSortableDragging;

  return (
    <>
      <div ref={setNodeRef} style={style} {...attributes}>
        <motion.div
          whileHover={!isBeingDragged ? { scale: 1.01 } : undefined}
          whileTap={!isBeingDragged ? { scale: 0.99 } : undefined}
          transition={{ duration: 0.15 }}
        >
          <div
            className={cn(
              "group/task relative cursor-pointer rounded-lg border p-3 pl-4 transition-all duration-200",
              "before:absolute before:inset-y-2 before:left-1.5 before:w-0.5 before:rounded-full",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ring/60",
              postItColor.bg,
              postItColor.text,
              postItColor.border,
              postItColor.accent,
              isBeingDragged && "opacity-40",
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
            {...listeners}
          >
            <div className="flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <h3 className="min-w-0 flex-1 text-sm leading-snug font-semibold tracking-tight">
                  {task.title}
                </h3>
                <div className="flex items-center gap-1.5 shrink-0">
                  {commentsCount > 0 && (
                    <div
                      className="flex items-center gap-1 rounded-full bg-muted/80 px-2 py-0.5"
                      title={`${commentsCount} comentario${commentsCount !== 1 ? "s" : ""}`}
                    >
                      <MessageSquare className="size-3 text-muted-foreground" />
                      <span className="text-[10px] font-medium text-muted-foreground">
                        {commentsCount}
                      </span>
                    </div>
                  )}
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
                        className="h-7 w-7 shrink-0 cursor-pointer rounded-md border border-transparent text-muted-foreground/90 transition-all hover:border-border/80 hover:bg-background hover:text-foreground focus-visible:border-border/80 focus-visible:bg-background"
                        onPointerDown={stopPropagation}
                        onClick={stopPropagation}
                        aria-label="Abrir acciones de tarea"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-44 rounded-xl border border-border/80 bg-card/95 p-1.5 shadow-lg backdrop-blur-sm"
                      onClick={stopPropagation}
                    >
                      <DropdownMenuLabel className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground/80">
                        Acciones
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator className="mx-1 my-1" />
                      <DropdownMenuItem
                        className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-medium"
                        onClick={(e) => {
                          stopPropagation(e);
                          onClick(task);
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-2" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        variant="destructive"
                        className="cursor-pointer rounded-md px-2.5 py-2 text-xs font-medium"
                        onClick={(e) => {
                          stopPropagation(e);
                          setDeleteConfirmOpen(true);
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
          </div>
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
              onClick={() => {
                removeTask({ id: task._id });
                setDeleteConfirmOpen(false);
              }}
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
