"use client";

import { AvatarDropdown } from "@/components/avatar-dropdown";
import { BoardPresenceAvatars } from "@/components/board-presence-avatars";
import { InvitationNotifications } from "@/components/invitation-notifications";
import { KanbanBoard } from "@/components/kanban-board";
import { Logo } from "@/components/logo";
import { ShareBoardDialog } from "@/components/share-board-dialog";
import { type ParticipantInfo, TaskDialog } from "@/components/task-dialog";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useAction, useMutation, useQuery } from "convex/react";
import { useCallback } from "react";
import { ArrowLeft, UserPlus } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

type Task = Doc<"tasks">;

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const board = useQuery(api.boards.getById, { id: boardId as never });
  const tasks = useQuery(api.tasks.listByBoard, { boardId: boardId as never });
  const updateStatusAndPosition = useMutation(api.tasks.updateStatusAndPosition);
  const participantIds = useQuery(api.boards.listParticipants, {
    boardId: boardId as never,
  });
  const currentUser = useQuery(api.auth.getCurrentUser);
  const getUsersPublicInfo = useAction(api.auth.getUsersPublicInfo);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [participantsInfo, setParticipantsInfo] = useState<ParticipantInfo[]>([]);

  useEffect(() => {
    if (participantIds !== undefined && participantIds.length > 1) {
      getUsersPublicInfo({ userIds: participantIds }).then(setParticipantsInfo);
    } else {
      setParticipantsInfo([]);
    }
  }, [participantIds, getUsersPublicInfo]);

  const participantsInfoMap = useMemo(
    () =>
      Object.fromEntries(participantsInfo.map((p) => [p._id, { name: p.name, image: p.image }])),
    [participantsInfo]
  );

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

  const handleMoveTask = useCallback(
    (taskId: Id<"tasks">, newStatus: string) => {
      if (tasks === undefined) return;
      const tasksInColumn = tasks.filter((t) => t.status === newStatus);
      const newPosition =
        tasksInColumn.length === 0
          ? 0
          : Math.max(...tasksInColumn.map((t) => t.position)) + 1;
      updateStatusAndPosition({ id: taskId, status: newStatus, position: newPosition });
    },
    [tasks, updateStatusAndPosition]
  );

  useEffect(() => {
    if (board === null) {
      router.replace("/dashboard");
    }
  }, [board, router]);

  if (board === undefined || tasks === undefined || participantIds === undefined) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex min-w-[280px] flex-1 flex-col rounded-lg border border-border bg-card p-4"
              >
                <div className="mb-3 h-5 w-24 animate-pulse rounded bg-muted" />
                <div className="flex flex-col gap-2">
                  {[1, 2, 3].map((j) => (
                    <div
                      key={j}
                      className="h-16 animate-pulse rounded border border-border bg-muted/50"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
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
              {board.description && <p className="text-muted-foreground">{board.description}</p>}
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
          onMoveTask={handleMoveTask}
          participantsInfoMap={participantsInfoMap}
        />
        <TaskDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          task={selectedTask}
          boardId={boardId as never}
          participantIds={participantIds}
          participantsInfo={participantsInfo}
        />
      </div>
    </div>
  );
}
