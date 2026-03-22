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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useState } from "react";
import { LuShield, LuTrash2, LuUserMinus, LuUsers } from "react-icons/lu";

type ShareBoardDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: Id<"boards">;
  isOwner: boolean;
  ownerId: string;
  currentUserId: string;
  participants: { _id: string; name: string | null; image: string | null }[];
  onLeaveBoard: () => void;
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

export function ShareBoardDialog({
  open,
  onOpenChange,
  boardId,
  isOwner,
  ownerId,
  currentUserId,
  participants,
  onLeaveBoard,
}: ShareBoardDialogProps) {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [participantError, setParticipantError] = useState<string | null>(null);
  const [participantSuccess, setParticipantSuccess] = useState<string | null>(null);
  const [participantToRemove, setParticipantToRemove] = useState<{
    _id: string;
    name: string | null;
  } | null>(null);
  const [leaveConfirmOpen, setLeaveConfirmOpen] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  const inviteByEmail = useAction(api.invitations.inviteByEmail);
  const removeParticipant = useMutation(api.boards.removeParticipant);
  const leaveBoard = useMutation(api.boards.leaveBoard);
  const pendingInvitations = useQuery(
    api.invitations.listPendingForBoard,
    open && isOwner ? { boardId } : "skip"
  );

  const orderedParticipants = [...participants].sort((a, b) => {
    if (a._id === ownerId) return -1;
    if (b._id === ownerId) return 1;
    return (a.name ?? a._id).localeCompare(b.name ?? b._id, "es", { sensitivity: "base" });
  });

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

  const handleRemoveParticipantConfirm = async () => {
    if (!participantToRemove || isRemoving) return;
    setParticipantError(null);
    setParticipantSuccess(null);
    setIsRemoving(true);
    try {
      await removeParticipant({
        boardId,
        userId: participantToRemove._id,
      });
      setParticipantSuccess(
        `Se eliminó a ${participantToRemove.name?.trim() || participantToRemove._id} del tablero`
      );
      setParticipantToRemove(null);
    } catch (err) {
      setParticipantError(
        err instanceof Error ? err.message : "No se pudo eliminar al participante"
      );
    } finally {
      setIsRemoving(false);
    }
  };

  const handleLeaveBoardConfirm = async () => {
    if (isLeaving) return;
    setParticipantError(null);
    setParticipantSuccess(null);
    setIsLeaving(true);
    try {
      await leaveBoard({ boardId });
      setLeaveConfirmOpen(false);
      onOpenChange(false);
      onLeaveBoard();
    } catch (err) {
      setParticipantError(err instanceof Error ? err.message : "No se pudo salir del tablero");
    } finally {
      setIsLeaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LuUsers className="h-4 w-4" />
              Participantes del tablero
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Miembros</p>
              {orderedParticipants.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay participantes para mostrar.</p>
              ) : (
                <ul className="space-y-2">
                  {orderedParticipants.map((participant) => {
                    const isParticipantOwner = participant._id === ownerId;
                    const isMe = participant._id === currentUserId;
                    return (
                      <li
                        key={participant._id}
                        className="flex items-center justify-between gap-2 rounded-md border border-border/60 bg-background px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Avatar className="h-7 w-7 shrink-0">
                            {participant.image ? (
                              <AvatarImage
                                src={participant.image}
                                alt={participant.name ?? participant._id}
                              />
                            ) : null}
                            <AvatarFallback className="text-xs">
                              {getInitials(participant.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium">
                              {participant.name?.trim() || participant._id}
                            </p>
                            <p className="truncate text-xs text-muted-foreground">
                              {isParticipantOwner ? "Propietario" : "Participante"}
                              {isMe ? " · tú" : ""}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isParticipantOwner && (
                            <span className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
                              <LuShield className="h-3.5 w-3.5" />
                              Admin
                            </span>
                          )}
                          {isOwner && !isParticipantOwner && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="cursor-pointer"
                              onClick={() =>
                                setParticipantToRemove({
                                  _id: participant._id,
                                  name: participant.name,
                                })
                              }
                            >
                              <LuTrash2 className="mr-1.5 h-3.5 w-3.5" />
                              Quitar
                            </Button>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {!isOwner && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                <p className="text-sm font-medium">Salir del tablero</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Perderás acceso a las tareas y vistas de este tablero.
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  className="mt-3 cursor-pointer"
                  onClick={() => setLeaveConfirmOpen(true)}
                >
                  <LuUserMinus className="mr-1.5 h-4 w-4" />
                  Salirme del tablero
                </Button>
              </div>
            )}

            {isOwner && (
              <form
                onSubmit={handleSubmit}
                className="rounded-lg border border-border/70 bg-muted/20 p-3"
              >
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
                <div className="mt-3 flex justify-end">
                  <Button type="submit" className="cursor-pointer">
                    Enviar invitación
                  </Button>
                </div>
              </form>
            )}

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
            {participantError && (
              <p className="text-sm text-destructive" role="alert">
                {participantError}
              </p>
            )}
            {participantSuccess && (
              <div className="text-sm text-green-600 dark:text-green-400">{participantSuccess}</div>
            )}

            {isOwner && pendingInvitations != null && pendingInvitations.length > 0 && (
              <div className="border-t pt-4">
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Invitaciones pendientes
                </p>
                <ul className="space-y-1 text-sm text-muted-foreground">
                  {pendingInvitations.map((inv) => (
                    <li key={inv._id}>Invitación enviada (pendiente de aceptación)</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer"
            >
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={participantToRemove !== null}
        onOpenChange={(open) => !open && setParticipantToRemove(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Quitar participante</AlertDialogTitle>
            <AlertDialogDescription>
              {`Se eliminará a ${participantToRemove?.name?.trim() || participantToRemove?._id || "este participante"} del tablero.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isRemoving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => void handleRemoveParticipantConfirm()}
              disabled={isRemoving}
            >
              {isRemoving ? "Quitando..." : "Quitar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={leaveConfirmOpen} onOpenChange={setLeaveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Salir del tablero?</AlertDialogTitle>
            <AlertDialogDescription>
              Dejarás de ver este tablero en tu dashboard hasta que te vuelvan a invitar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer" disabled={isLeaving}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              className="cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive/20"
              onClick={() => void handleLeaveBoardConfirm()}
              disabled={isLeaving}
            >
              {isLeaving ? "Saliendo..." : "Salir del tablero"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
