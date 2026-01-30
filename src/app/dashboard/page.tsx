"use client";

import { useState } from "react";
import Link from "next/link";
import type { Id } from "@/convex/_generated/dataModel";
import { BoardDialog } from "@/components/board-dialog";
import { Logo } from "@/components/logo";
import { AvatarDropdown } from "@/components/avatar-dropdown";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useMutation, useQuery } from "convex/react";
import { LayoutDashboard, Pencil, Plus, Trash2 } from "lucide-react";

export default function DashboardPage() {
  const boards = useQuery(api.boards.list);
  const createBoard = useMutation(api.boards.create);
  const updateBoard = useMutation(api.boards.update);
  const removeBoard = useMutation(api.boards.remove);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingBoard, setEditingBoard] = useState<{
    _id: Id<"boards">;
    name: string;
    description?: string;
  } | null>(null);

  const handleSave = (data: {
    name: string;
    description?: string;
    id?: Id<"boards">;
  }) => {
    if (data.id) {
      updateBoard({
        id: data.id,
        name: data.name,
        description: data.description,
      });
    } else {
      createBoard({ name: data.name, description: data.description });
    }
    setEditingBoard(null);
    setDialogOpen(false);
  };

  const handleEdit = (board: { _id: Id<"boards">; name: string; description?: string }) => {
    setEditingBoard(board);
    setDialogOpen(true);
  };

  const handleDelete = (id: Id<"boards">) => {
    if (confirm("¿Eliminar este tablero?")) {
      removeBoard({ id });
    }
  };

  const openCreateDialog = () => {
    setEditingBoard(null);
    setDialogOpen(true);
  };

  if (boards === undefined) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Cargando tableros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="flex items-center justify-between border-b pb-4">
          <Logo href="/dashboard" className="text-xl" />
          <AvatarDropdown />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableros</h1>
            <p className="text-muted-foreground">Gestiona tus tableros</p>
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo tablero
          </Button>
        </div>

        <BoardDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          board={editingBoard}
          onSave={handleSave}
        />

        {boards.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No hay tableros aún</p>
              <Button variant="outline" onClick={openCreateDialog}>
                <Plus className="h-4 w-4 mr-2" />
                Crear primer tablero
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {boards.map((board) => (
              <Link key={board._id} href={`/dashboard/boards/${board._id}`} className="cursor-pointer">
                <Card className="transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-center gap-2">
                        <LayoutDashboard className="h-5 w-5 shrink-0 text-muted-foreground" />
                        <CardTitle className="text-lg truncate">{board.name}</CardTitle>
                      </div>
                      <div className="flex shrink-0 gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleEdit(board);
                          }}
                          aria-label="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleDelete(board._id);
                          }}
                          aria-label="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    {board.description && (
                      <CardDescription className="mt-2">{board.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Creado {new Date(board.created_at).toLocaleDateString("es-ES")}
                      {board.updated_at !== board.created_at && (
                        <> · Actualizado {new Date(board.updated_at).toLocaleDateString("es-ES")}</>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
