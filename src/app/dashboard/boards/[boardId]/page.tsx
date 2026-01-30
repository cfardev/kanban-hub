"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import type { Doc } from "@/convex/_generated/dataModel";
import { api } from "@/convex/_generated/api";
import { KanbanBoard } from "@/components/kanban-board";
import { TaskDialog } from "@/components/task-dialog";
import { Logo } from "@/components/logo";
import { AvatarDropdown } from "@/components/avatar-dropdown";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Task = Doc<"tasks">;

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const boardId = params.boardId as string;
  const board = useQuery(api.boards.getById, { id: boardId as never });
  const tasks = useQuery(api.tasks.listByBoard, { boardId: boardId as never });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const openNewTask = () => {
    setSelectedTask(null);
    setDialogOpen(true);
  };

  const openTask = (task: Task) => {
    setSelectedTask(task);
    setDialogOpen(true);
  };

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
    router.replace("/dashboard");
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <Logo href="/dashboard" className="text-xl" />
          <AvatarDropdown />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild>
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
          </div>
        </div>
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
