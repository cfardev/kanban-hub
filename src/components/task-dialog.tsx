"use client";

import { useEffect, useState } from "react";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Task = Doc<"tasks">;

type TaskDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  boardId: Id<"boards">;
};

export function TaskDialog({
  open,
  onOpenChange,
  task,
  boardId,
}: TaskDialogProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const createTask = useMutation(api.tasks.create);
  const updateTask = useMutation(api.tasks.update);
  const removeTask = useMutation(api.tasks.remove);

  const isCreate = task === null;

  useEffect(() => {
    if (open) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description ?? "");
      } else {
        setTitle("");
        setDescription("");
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
      });
    } else {
      updateTask({
        id: task._id,
        title: trimmedTitle,
        description: description.trim() || undefined,
        status: task.status,
      });
    }
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (!task) return;
    if (confirm("¿Eliminar esta tarea?")) {
      removeTask({ id: task._id });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{isCreate ? "Nueva tarea" : "Editar tarea"}</DialogTitle>
            <DialogDescription>
              {isCreate
                ? "Añade los datos de la tarea."
                : "Modifica los datos de la tarea."}
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
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            {!isCreate && (
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
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
  );
}
