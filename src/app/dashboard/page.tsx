"use client";

import { AvatarDropdown } from "@/components/avatar-dropdown";
import { BoardDialog } from "@/components/board-dialog";
import { InvitationNotifications } from "@/components/invitation-notifications";
import { Logo } from "@/components/logo";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { LayoutDashboard, Pencil, Plus, Trash2 } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const boardGridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const boardCardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const router = useRouter();
  const user = useQuery(api.auth.getCurrentUser);
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
  const [boardToDelete, setBoardToDelete] = useState<Id<"boards"> | null>(null);

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }
  if (user === null) {
    router.replace("/");
    return null;
  }

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

  const handleDeleteClick = (id: Id<"boards">) => {
    setBoardToDelete(id);
  };

  const handleDeleteConfirm = () => {
    if (boardToDelete) {
      removeBoard({ id: boardToDelete });
      setBoardToDelete(null);
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
          <div className="flex items-center gap-2">
            <InvitationNotifications />
            <AvatarDropdown />
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableros</h1>
            <p className="text-muted-foreground">Gestiona tus tableros</p>
          </div>
          <Button onClick={openCreateDialog} className="cursor-pointer">
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

        <AlertDialog
          open={boardToDelete !== null}
          onOpenChange={(open) => !open && setBoardToDelete(null)}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Eliminar este tablero?</AlertDialogTitle>
              <AlertDialogDescription>
                Se eliminarán también todas las tareas del tablero. Esta acción no se puede
                deshacer.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="cursor-pointer bg-destructive/10 text-destructive hover:bg-destructive/20"
              >
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {boards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <p className="text-muted-foreground mb-4">No hay tableros aún</p>
                <Button variant="outline" onClick={openCreateDialog} className="cursor-pointer">
                  <Plus className="h-4 w-4 mr-2" />
                  Crear primer tablero
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <motion.div
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={boardGridVariants}
            initial="hidden"
            animate="visible"
          >
            {boards.map((board) => (
              <motion.div key={board._id} variants={boardCardVariants}>
                <Link href={`/dashboard/boards/${board._id}`} className="cursor-pointer block">
                  <motion.div
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.99 }}
                    transition={{ duration: 0.2 }}
                  >
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
                              className="h-8 w-8 cursor-pointer"
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
                              className="h-8 w-8 cursor-pointer text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleDeleteClick(board._id);
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
                            <>
                              {" "}
                              · Actualizado {new Date(board.updated_at).toLocaleDateString("es-ES")}
                            </>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
