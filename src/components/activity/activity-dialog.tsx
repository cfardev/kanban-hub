"use client";

import { ActivityList } from "@/components/activity/activity-list";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { Clock, X } from "lucide-react";
import { useState } from "react";

type ActivityDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: Id<"boards">;
  participantsInfo: Record<string, { name: string | null; image: string | null }>;
};

export function ActivityDialog({
  open,
  onOpenChange,
  boardId,
  participantsInfo,
}: ActivityDialogProps) {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    const task = document.querySelector(`[data-task-id="${taskId}"]`) as HTMLElement;
    if (task) {
      task.scrollIntoView({ behavior: "smooth", block: "center" });
      task.classList.add("ring-2", "ring-primary");
      setTimeout(() => {
        task.classList.remove("ring-2", "ring-primary");
      }, 2000);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg rounded-xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-2 space-y-1 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <DialogTitle className="text-base font-semibold tracking-tight">
                  Historial de actividad
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground">
                  Registro de acciones en el tablero
                </DialogDescription>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer rounded-full p-1.5 text-muted-foreground/50 hover:bg-muted hover:text-foreground transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </DialogHeader>

        <div className="px-6 py-4 max-h-[600px] overflow-y-auto">
          <ActivityList
            boardId={boardId}
            participantsInfo={participantsInfo}
            onTaskClick={handleTaskClick}
            limit={50}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
