"use client";

import { useState } from "react";
import type { Id } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { useAction, useQuery } from "convex/react";
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

type ShareBoardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: Id<"boards">;
};

export function ShareBoardDialog({
  open,
  onOpenChange,
  boardId,
}: ShareBoardDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const inviteByEmail = useAction(api.invitations.inviteByEmail);
  const pendingInvitations = useQuery(
    api.invitations.listPendingForBoard,
    open ? { boardId } : "skip"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) return;
    try {
      await inviteByEmail({ boardId, email: trimmed });
      setSuccess(true);
      setEmail("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al enviar la invitación");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Compartir tablero</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="invite-email">Correo del usuario a invitar</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            {success && (
              <div className="text-sm text-green-600 dark:text-green-400">
                Invitación enviada correctamente.
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cerrar
            </Button>
            <Button type="submit">Enviar invitación</Button>
          </DialogFooter>
        </form>
        {pendingInvitations != null && pendingInvitations.length > 0 && (
          <div className="mt-4 border-t pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Invitaciones pendientes
            </p>
            <ul className="text-sm text-muted-foreground space-y-1">
              {pendingInvitations.map((inv) => (
                <li key={inv._id}>
                  Invitación enviada (pendiente de aceptación)
                </li>
              ))}
            </ul>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
