"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Bell, Inbox, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function InvitationNotifications() {
  const router = useRouter();
  const invitations = useQuery(api.invitations.listMine);
  const accept = useMutation(api.invitations.accept);
  const reject = useMutation(api.invitations.reject);

  const count = invitations?.length ?? 0;

  const handleAccept = async (invitationId: Id<"board_invitations">, boardId: Id<"boards">) => {
    await accept({ invitationId });
    router.push(`/dashboard/boards/${boardId}`);
  };

  const handleReject = async (invitationId: Id<"board_invitations">) => {
    await reject({ invitationId });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="group relative inline-flex cursor-pointer items-center justify-center rounded-full p-2.5 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 active:scale-[0.97]"
          aria-label="Notificaciones de invitaciones"
        >
          <Bell className="h-5 w-5 shrink-0 transition-transform duration-200 group-hover:rotate-12" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-semibold text-destructive-foreground shadow-sm ring-2 ring-background">
              {count > 99 ? "99+" : count}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-xl p-0">
        <div className="flex items-center gap-3 px-4 pt-4 pb-2">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
            <Bell className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold tracking-tight">Invitaciones a tableros</p>
            <p className="text-xs text-muted-foreground">
              {invitations === undefined
                ? "Verificando..."
                : count === 0
                  ? "Sin invitaciones nuevas"
                  : `${count} pendiente${count !== 1 ? "s" : ""}`}
            </p>
          </div>
        </div>
        <DropdownMenuSeparator className="my-2" />
        <div className="px-4 pb-4">
          {invitations === undefined ? (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Cargando...
            </div>
          ) : invitations.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  No tienes invitaciones pendientes
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Cuando te inviten a un tablero, aparecerá aquí
                </p>
              </div>
            </div>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto">
              {invitations.map((inv) => (
                <li
                  key={inv._id}
                  className="rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:bg-muted/50"
                >
                  <p className="text-sm">
                    <span className="font-medium">{inv.inviter_name}</span> te invitó a{" "}
                    <span className="font-medium">{inv.board_name}</span>
                  </p>
                  <div className="mt-2 flex gap-2">
                    <Button
                      size="sm"
                      variant="default"
                      className="cursor-pointer"
                      onClick={() => handleAccept(inv._id, inv.board_id)}
                    >
                      Aceptar
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="cursor-pointer"
                      onClick={() => handleReject(inv._id)}
                    >
                      Rechazar
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
