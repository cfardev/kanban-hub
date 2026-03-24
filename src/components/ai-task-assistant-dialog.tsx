"use client";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { cn } from "@/lib/utils";
import { useAction, useMutation } from "convex/react";
import { ConvexError } from "convex/values";
import { useMemo, useState } from "react";
import { LuBot, LuCheck, LuLoaderCircle, LuSparkles, LuX } from "react-icons/lu";

type SuggestedTask = {
  title: string;
  description?: string;
  status: "por_empezar" | "en_curso" | "terminado";
  assignee_id?: string;
  assignee_name?: string;
  tags?: Id<"tags">[];
  tag_names: string[];
  warnings: string[];
};

const STATUS_LABEL: Record<SuggestedTask["status"], string> = {
  por_empezar: "Por empezar",
  en_curso: "En curso",
  terminado: "Terminado",
};

export function AiTaskAssistantDialog({
  open,
  onOpenChange,
  boardId,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  boardId: Id<"boards">;
}) {
  const [prompt, setPrompt] = useState("");
  const [modelName, setModelName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<SuggestedTask[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createdMessage, setCreatedMessage] = useState<string | null>(null);

  const generateTaskSuggestions = useAction(api.ai.generateTaskSuggestions);
  const createTasksFromSuggestions = useMutation(api.ai.createTasksFromSuggestions);

  const hasSuggestions = suggestions.length > 0;
  const promptIsValid = prompt.trim().length >= 10;

  const suggestionPayload = useMemo(
    () =>
      suggestions.map((task) => ({
        title: task.title,
        description: task.description,
        status: task.status,
        assignee_id: task.assignee_id,
        tags: task.tags,
      })),
    [suggestions]
  );

  const resetState = () => {
    setError(null);
    setCreatedMessage(null);
    setModelName("");
    setSuggestions([]);
  };

  const handleGenerate = async () => {
    if (!promptIsValid || isGenerating) return;
    setError(null);
    setCreatedMessage(null);
    setIsGenerating(true);
    try {
      const result = await generateTaskSuggestions({
        boardId,
        prompt: prompt.trim(),
      });
      setSuggestions(result.suggestions as SuggestedTask[]);
      setModelName(result.model ?? "");
    } catch (err) {
      setSuggestions([]);
      setModelName("");
      setError(
        err instanceof ConvexError
          ? (err.data as string)
          : err instanceof Error
            ? err.message
            : "No se pudieron generar sugerencias"
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreate = async () => {
    if (!hasSuggestions || isCreating) return;
    setError(null);
    setCreatedMessage(null);
    setIsCreating(true);
    try {
      const result = await createTasksFromSuggestions({
        boardId,
        suggestions: suggestionPayload,
      });
      setCreatedMessage(`Se crearon ${result.created} tareas.`);
      resetState();
      setPrompt("");
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron crear las tareas");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          resetState();
        }
        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-w-3xl p-0 overflow-hidden">
        <DialogHeader className="border-b border-border/70 bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-background px-5 py-4">
          <DialogTitle className="flex items-center gap-2 text-base">
            <LuBot className="h-4 w-4 text-sky-600" />
            Asistente IA de tareas
          </DialogTitle>
          <DialogDescription className="max-w-[62ch]">
            Describe objetivos, entregables y fechas. La IA propone tareas y tú confirmas cuáles
            crear.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 p-5">
          <div className="grid gap-2">
            <Label htmlFor="ai-prompt">¿Qué necesitas planificar?</Label>
            <Textarea
              id="ai-prompt"
              placeholder="Ejemplo: Planifica el sprint de onboarding con diseño, backend, QA y documentación."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={5}
              className="min-h-28"
            />
            <p className="text-[11px] text-muted-foreground">Mínimo 10 caracteres.</p>
          </div>

          {modelName ? (
            <div className="rounded-md border border-border/70 bg-muted/25 px-3 py-2 text-[11px] text-muted-foreground">
              Modelo usado: <span className="font-medium text-foreground">{modelName}</span>
            </div>
          ) : null}

          {hasSuggestions ? (
            <div className="grid gap-2 max-h-[44vh] overflow-auto pr-1">
              {suggestions.map((task, index) => (
                <div
                  key={`${task.title}-${index}`}
                  className="rounded-md border border-border bg-card p-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-semibold leading-tight">{task.title}</p>
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-[10px] font-medium",
                        task.status === "terminado"
                          ? "border-emerald-300 bg-emerald-500/10 text-emerald-700"
                          : task.status === "en_curso"
                            ? "border-amber-300 bg-amber-500/10 text-amber-700"
                            : "border-sky-300 bg-sky-500/10 text-sky-700"
                      )}
                    >
                      {STATUS_LABEL[task.status]}
                    </span>
                  </div>
                  {task.description ? (
                    <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                  ) : null}
                  <div className="mt-2 flex flex-wrap gap-1.5 text-[11px]">
                    <span className="rounded-md border border-border/80 px-2 py-0.5">
                      Responsable: {task.assignee_name ?? "Sin asignar"}
                    </span>
                    <span className="rounded-md border border-border/80 px-2 py-0.5">
                      Tags:{" "}
                      {task.tag_names.length > 0 ? task.tag_names.join(", ") : "Sin etiquetas"}
                    </span>
                  </div>
                  {task.warnings.length > 0 ? (
                    <p className="mt-2 text-[11px] text-amber-700">{task.warnings.join(". ")}</p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-md border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
              Genera una propuesta para ver la vista previa de tareas.
            </div>
          )}

          {error ? <p className="text-sm text-destructive">{error}</p> : null}
          {createdMessage ? <p className="text-sm text-emerald-700">{createdMessage}</p> : null}
        </div>

        <DialogFooter className="border-t border-border/70 bg-muted/20 px-5 py-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="cursor-pointer"
          >
            <LuX className="mr-1.5 h-4 w-4" />
            Cerrar
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void handleGenerate()}
            disabled={!promptIsValid || isGenerating}
            className="cursor-pointer"
          >
            {isGenerating ? (
              <>
                <LuLoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <LuSparkles className="mr-1.5 h-4 w-4" />
                Generar propuesta
              </>
            )}
          </Button>
          <Button
            type="button"
            onClick={() => void handleCreate()}
            disabled={!hasSuggestions || isCreating}
            className="cursor-pointer"
          >
            {isCreating ? (
              <>
                <LuLoaderCircle className="mr-1.5 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              <>
                <LuCheck className="mr-1.5 h-4 w-4" />
                Crear {suggestions.length} tareas
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
