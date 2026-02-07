"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Bell } from "lucide-react";
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
      <DropdownMenuContent align="end" className="w-80">
        <div className="px-2 py-2">
          <p className="text-sm font-medium">Invitaciones a tableros</p>
        </div>
        {invitations === undefined ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">Cargando...</p>
        ) : invitations.length === 0 ? (
          <p className="px-2 py-4 text-sm text-muted-foreground">
            No tienes invitaciones pendientes.
          </p>
        ) : (
          <ul className="max-h-72 overflow-y-auto">
            {invitations.map((inv) => (
              <li key={inv._id} className="border-b border-border px-2 py-3 last:border-0">
                <p className="text-sm">
                  <span className="font-medium">{inv.inviter_name}</span> te ha invitado al tablero{" "}
                  <span className="font-medium">{inv.board_name}</span>.
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
