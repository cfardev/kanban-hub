"use client";

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
import { Textarea } from "@/components/ui/textarea";
import type { Id } from "@/convex/_generated/dataModel";
import { LayoutGrid, Plus } from "lucide-react";
import { useEffect, useState } from "react";

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

export function BoardDialog({ open, onOpenChange, board, onSave }: BoardDialogProps) {
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
      <DialogContent className="max-w-xl overflow-hidden border-border/70 p-0">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="relative border-b border-border/70 bg-gradient-to-br from-primary/10 via-primary/5 to-background px-5 py-4">
            <div className="pointer-events-none absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-md bg-background/80 text-primary shadow-sm ring-1 ring-border/70">
              {board ? <LayoutGrid className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </div>
            <DialogTitle className="text-base tracking-tight">
              {board ? "Editar tablero" : "Nuevo tablero"}
            </DialogTitle>
            <DialogDescription className="max-w-[32ch] text-[11px] leading-relaxed">
              {board
                ? "Actualiza el nombre y la descripcion para mantener tu espacio ordenado."
                : "Crea un espacio para organizar tareas, ideas y prioridades de tu equipo."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 px-5 py-5">
            <div className="grid gap-1.5">
              <Label htmlFor="board-name">Nombre</Label>
              <Input
                id="board-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nombre del tablero"
                className="h-9"
                maxLength={80}
                required
              />
              <p className="text-[10px] text-muted-foreground">
                Usa un nombre claro para encontrarlo rapido.
              </p>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="board-description">Descripción</Label>
              <Textarea
                id="board-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descripción (opcional)"
                className="min-h-24 resize-none"
                maxLength={240}
              />
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Define objetivo, alcance o notas clave.</span>
                <span>{description.length}/240</span>
              </div>
            </div>
          </div>
          <DialogFooter className="border-t border-border/70 bg-muted/20 px-5 py-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="min-w-24 bg-primary/90 hover:bg-primary">
              {board ? "Guardar" : "Crear"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
