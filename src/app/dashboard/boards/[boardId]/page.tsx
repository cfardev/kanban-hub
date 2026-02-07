"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/task-dialog";
import { ShareBoardDialog } from "@/components/share-board-dialog";
import { BoardPresenceAvatars } from "@/components/board-presence-avatars";
import { InvitationNotifications } from "@/components/invitation-notifications";
import { Logo } from "@/components/logo";
import { AvatarDropdown } from "@/components/avatar-dropdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft, UserPlus } from "lucide-react";

type Task = Doc<"tasks">;

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const board = useQuery(api.boards.getById, { id: boardId as never });
  const tasks = useQuery(api.tasks.listByBoard, { boardId: boardId as never });
  const currentUser = useQuery(api.auth.getCurrentUser);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const isOwner =
    board != null &&
    currentUser != null &&
    (currentUser as { subject?: string }).subject === board.owner_id;

  const openNewTask = () => {
    setSelectedTask(null);
    setDialogOpen(true);
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

  useEffect(() => {
    if (board === null) {
      router.replace("/dashboard");
    }
  }, [board, router]);

  if (board === undefined || tasks === undefined) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Cargando tablero...</p>
        </div>
      </div>
    );
  }

  if (board === null) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <Logo href="/dashboard" className="text-xl" />
          <div className="flex items-center gap-2">
            <InvitationNotifications />
            <AvatarDropdown />
          </div>
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="cursor-pointer" asChild>
              <Link href="/dashboard" aria-label="Volver">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{board.name}</h1>
              {board.description && (
                <p className="text-muted-foreground">{board.description}</p>
              )}
            </div>
            {isOwner && (
              <Button
                variant="outline"
                size="sm"
                className="cursor-pointer"
                onClick={() => setShareDialogOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Compartir
              </Button>
            )}
          </div>
          {currentUser && (currentUser as { subject?: string }).subject && (
            <BoardPresenceAvatars
              key={boardId}
              boardId={boardId}
              currentUserId={(currentUser as { subject: string }).subject}
            />
          )}
        </div>
        <ShareBoardDialog
          open={shareDialogOpen}
          onOpenChange={setShareDialogOpen}
          boardId={boardId as never}
        />
        <KanbanBoard
          boardId={boardId}
          tasks={tasks}
          onTaskClick={openTask}
          onNewTask={openNewTask}
        />
        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={selectedTask}
          boardId={boardId as never}
        />
      </div>
    </div>
  );
}
