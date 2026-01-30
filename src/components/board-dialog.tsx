"use client";

import { useEffect, useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type BoardForEdit = {
  _id: Id<"boards">;
  name: string;
  description?: string;
};

type BoardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  board?: BoardForEdit | null;
  onSave: (data: { name: string; description?: string; id?: Id<"boards"> }) => void;
};

export function BoardDialog({
  open,
  onOpenChange,
  board,
  onSave,
}: BoardDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    if (open) {
      setName(board?.name ?? "");
      setDescription(board?.description ?? "");
    }
  }, [open, board?.name, board?.description]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;
    onSave({
      name: trimmedName,
      description: description.trim() || undefined,
      id: board?._id,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{board ? "Editar tablero" : "Nuevo tablero"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="board-name">Nombre</Label>
              <Input
                id="board-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del tablero"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="board-description">Descripción</Label>
              <Input
                id="board-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">{board ? "Guardar" : "Crear"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
