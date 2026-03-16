"use client";

import { TagSelector } from "@/components/tag-selector";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { STATUS_OPTIONS, type TaskStatus } from "@/lib/task-status";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";
import {
  LuCheck,
  LuCircleDashed,
  LuClock3,
  LuPlus,
  LuSquareCheck,
  LuTrash2,
  LuX,
} from "react-icons/lu";

type Task = Doc<"tasks">;

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

export type ParticipantInfo = {
  _id: string;
  name: string | null;
  image: string | null;
};

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  boardId: Id<"boards">;
  participantIds: string[];
  participantsInfo: ParticipantInfo[];
  availableTags: Doc<"tags">[];
};

/** Sentinel value for "unassigned"; Radix Select disallows value="". */
const UNASSIGNED_VALUE = "__unassigned__";

const STATUS_META: Record<
  TaskStatus,
  { icon: typeof LuSquareCheck; description: string; className: string }
> = {
  por_empezar: {
    icon: LuCircleDashed,
    description: "Pendiente de iniciar",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  en_curso: {
    icon: LuClock3,
    description: "Trabajo en progreso",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  terminado: {
    icon: LuCheck,
    description: "Trabajo completado",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
};

export function TaskDialog({
  open,
  onOpenChange,
  task,
  boardId,
  participantIds,
  participantsInfo,
  availableTags,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("por_empezar");
  const [assigneeId, setAssigneeId] = useState(UNASSIGNED_VALUE);
  const [selectedTagIds, setSelectedTagIds] = useState<Id<"tags">[]>([]);

  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const isCreate = task === null;
  const showAssignee = participantIds.length > 1;

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description ?? "");
        setStatus(task.status as TaskStatus);
        setAssigneeId(task.assignee_id ?? UNASSIGNED_VALUE);
        setSelectedTagIds(task.tags ?? []);
      } else {
        setTitle("");
        setDescription("");
        setStatus("por_empezar");
        setAssigneeId(UNASSIGNED_VALUE);
        setSelectedTagIds([]);
      }
    }
  }, [open, task]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    if (isCreate) {
      createTask({
        boardId,
        title: trimmedTitle,
        description: description.trim() || undefined,
        status,
        assignee_id: assigneeId === UNASSIGNED_VALUE ? undefined : assigneeId,
        tags: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
    } else {
      updateTask({
        id: task._id,
        title: trimmedTitle,
        description: description.trim() || undefined,
        status,
        assignee_id: assigneeId === UNASSIGNED_VALUE ? undefined : assigneeId,
        tags: selectedTagIds.length > 0 ? selectedTagIds : undefined,
      });
    }
    onOpenChange(false);
  };

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleDeleteClick = () => {
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (!task) return;
    removeTask({ id: task._id });
    setDeleteConfirmOpen(false);
    onOpenChange(false);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md rounded-xl p-0 gap-0 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <DialogHeader className="px-6 pt-6 pb-2 space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <LuSquareCheck className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-base font-semibold tracking-tight">
                    {isCreate ? "Nueva tarea" : "Editar tarea"}
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground">
                    {isCreate ? "Añade los datos de la tarea." : "Modifica los datos de la tarea."}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>
            <div className="grid gap-5 px-6 py-5">
              <div className="grid gap-2">
                <Label htmlFor="task-title" className="text-xs font-medium">
                  Título
                </Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la tarea"
                  required
                  className="h-9 rounded-md"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-description" className="text-xs font-medium">
                  Descripción
                </Label>
                <Textarea
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                  rows={3}
                  className="min-h-[72px] resize-none rounded-md"
                />
              </div>
              <div className="grid gap-2">
                <Label className="text-xs font-medium">Estado</Label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {STATUS_OPTIONS.map(({ value, label }) => {
                    const meta = STATUS_META[value];
                    const Icon = meta.icon;
                    const isSelected = status === value;

                    return (
                      <Button
                        key={value}
                        type="button"
                        variant="outline"
                        className={cn(
                          "h-auto cursor-pointer flex-col items-start gap-1.5 rounded-lg border px-3 py-3 text-left transition-colors",
                          isSelected
                            ? meta.className
                            : "border-border bg-background text-foreground hover:bg-muted/60"
                        )}
                        onClick={() => setStatus(value)}
                      >
                        <span className="flex items-center gap-2 text-sm font-medium">
                          <Icon className="size-4 shrink-0" />
                          {label}
                        </span>
                        <span className="text-[11px] font-normal opacity-80">
                          {meta.description}
                        </span>
                      </Button>
                    );
                  })}
                </div>
              </div>
              {showAssignee && (
                <div className="grid gap-2">
                  <Label className="text-xs font-medium">Asignar a</Label>
                  <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v)}>
                    <SelectTrigger className="w-full h-9 rounded-md cursor-pointer [&>span]:flex [&>span]:items-center [&>span]:gap-2">
                      <SelectValue placeholder="Sin asignar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UNASSIGNED_VALUE} className="cursor-pointer">
                        Sin asignar
                      </SelectItem>
                      {participantIds.map((id) => {
                        const info = participantsInfo.find((p) => p._id === id);
                        const name = info?.name?.trim() || id;
                        return (
                          <SelectItem
                            key={id}
                            value={id}
                            className="cursor-pointer flex items-center gap-2"
                          >
                            <Avatar className="h-6 w-6 shrink-0">
                              {info?.image ? <AvatarImage src={info.image} alt={name} /> : null}
                              <AvatarFallback className="text-xs">
                                {getInitials(info?.name)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{name}</span>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <TagSelector
                boardId={boardId}
                availableTags={availableTags}
                selectedTagIds={selectedTagIds}
                onTagToggle={(tagId) => {
                  setSelectedTagIds((prev) =>
                    prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
                  );
                }}
              />
            </div>
            <div className="border-t border-border bg-muted/30 px-6 py-4">
              <DialogFooter className="flex-row flex-wrap gap-2 sm:justify-between">
                {!isCreate ? (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteClick}
                    className="cursor-pointer rounded-md h-9 gap-1.5"
                  >
                    <LuTrash2 className="size-4 shrink-0" />
                    Eliminar
                  </Button>
                ) : (
                  <div />
                )}
                <div className="flex gap-2 ml-auto">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                    className="cursor-pointer rounded-md h-9 gap-1.5"
                  >
                    <LuX className="size-4 shrink-0" />
                    Cancelar
                  </Button>
                  <Button type="submit" className="cursor-pointer rounded-md h-9 gap-1.5">
                    {isCreate ? (
                      <>
                        <LuPlus className="size-4 shrink-0" />
                        Crear
                      </>
                    ) : (
                      <>
                        <LuCheck className="size-4 shrink-0" />
                        Guardar
                      </>
                    )}
                  </Button>
                </div>
              </DialogFooter>
            </div>
          </form>
        </DialogContent>
      </Dialog>
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
