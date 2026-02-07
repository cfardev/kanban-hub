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
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useEffect, useState } from "react";

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
};

/** Sentinel value for "unassigned"; Radix Select disallows value="". */
const UNASSIGNED_VALUE = "__unassigned__";

export function TaskDialog({
  open,
  onOpenChange,
  task,
  boardId,
  participantIds,
  participantsInfo,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assigneeId, setAssigneeId] = useState(UNASSIGNED_VALUE);

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
        setAssigneeId(task.assignee_id ?? UNASSIGNED_VALUE);
      } else {
        setTitle("");
        setDescription("");
        setAssigneeId(UNASSIGNED_VALUE);
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
        status: "por_empezar",
        assignee_id: assigneeId === UNASSIGNED_VALUE ? undefined : assigneeId,
      });
    } else {
      updateTask({
        id: task._id,
        title: trimmedTitle,
        description: description.trim() || undefined,
        status: task.status,
        assignee_id: assigneeId === UNASSIGNED_VALUE ? undefined : assigneeId,
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
        <DialogContent className="sm:max-w-md">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{isCreate ? "Nueva tarea" : "Editar tarea"}</DialogTitle>
              <DialogDescription>
                {isCreate ? "Añade los datos de la tarea." : "Modifica los datos de la tarea."}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="task-title">Título</Label>
                <Input
                  id="task-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Título de la tarea"
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="task-description">Descripción</Label>
                <Input
                  id="task-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción (opcional)"
                />
              </div>
              {showAssignee && (
                <div className="grid gap-2">
                  <Label>Asignar a</Label>
                  <Select value={assigneeId} onValueChange={(v) => setAssigneeId(v)}>
                    <SelectTrigger className="w-full cursor-pointer">
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
            </div>
            <DialogFooter className="gap-2 sm:gap-0">
              {!isCreate && (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={handleDeleteClick}
                  className="mr-auto cursor-pointer"
                >
                  Eliminar
                </Button>
              )}
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="cursor-pointer"
              >
                Cancelar
              </Button>
              <Button type="submit" className="cursor-pointer">
                {isCreate ? "Crear" : "Guardar"}
              </Button>
            </DialogFooter>
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
