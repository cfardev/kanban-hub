"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { CheckCircle2, Circle, Clock, Plus } from "lucide-react";

const statusConfig = {
  todo: { label: "Por hacer", icon: Circle, variant: "outline" as const },
  "in-progress": { label: "En progreso", icon: Clock, variant: "secondary" as const },
  done: { label: "Completada", icon: CheckCircle2, variant: "default" as const },
};

export default function TasksPage() {
  const tasks = useQuery(api.tasks.list);

  if (tasks === undefined) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="mx-auto max-w-7xl">
          <p className="text-muted-foreground">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tareas</h1>
            <p className="text-muted-foreground">Gestiona tus tareas</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Tarea
          </Button>
        </div>

        {/* Tasks Grid */}
        {tasks.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground mb-4">No hay tareas aún</p>
              <Button variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Crear primera tarea
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => {
              const taskStatus = task.status || "todo";
              const status =
                statusConfig[taskStatus as keyof typeof statusConfig] || statusConfig.todo;
              const StatusIcon = status.icon;
              const title = task.title || task.text || "Sin título";
              const createdAt = task.createdAt || task._creationTime;

              return (
                <Card key={task._id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg">{title}</CardTitle>
                      <Badge variant={status.variant}>
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {status.label}
                      </Badge>
                    </div>
                    {task.description && (
                      <CardDescription className="mt-2">{task.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-xs text-muted-foreground">
                      Creada {new Date(createdAt).toLocaleDateString("es-ES")}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
