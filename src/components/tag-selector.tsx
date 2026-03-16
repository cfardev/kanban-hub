"use client";

import { type ColorClass, TagBadge } from "@/components/tag-badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation } from "convex/react";
import { useState } from "react";
import { LuCheck, LuPlus, LuSearch } from "react-icons/lu";

const AVAILABLE_COLORS: ColorClass[] = [
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "pink",
  "orange",
  "cyan",
  "slate",
  "indigo",
];

type TagSelectorProps = {
  boardId: Id<"boards">;
  availableTags: Doc<"tags">[];
  selectedTagIds: Id<"tags">[];
  onTagToggle: (tagId: Id<"tags">) => void;
  maxTags?: number;
};

export function TagSelector({
  boardId,
  availableTags,
  selectedTagIds,
  onTagToggle,
  maxTags = 3,
}: TagSelectorProps) {
  const [newTagColor, setNewTagColor] = useState<ColorClass>("blue");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const createTag = useMutation(api.tags.create);

  const canAddMore = selectedTagIds.length < maxTags;
  const query = searchQuery.trim().toLowerCase();

  const selectableTags = availableTags.filter((tag) => !selectedTagIds.includes(tag._id));
  const filteredTags = selectableTags.filter((tag) => tag.name.toLowerCase().includes(query));

  const exactTagMatch = availableTags.find((tag) => tag.name.toLowerCase() === query);
  const canCreateFromQuery = query.length > 0 && !exactTagMatch && canAddMore;

  const handleCreateTag = async () => {
    const name = searchQuery.trim();
    if (!name || !canAddMore || isCreating) return;
    setError(null);
    setIsCreating(true);
    try {
      const newTagId = await createTag({
        boardId,
        name,
        color: newTagColor,
      });
      onTagToggle(newTagId);
      setSearchQuery("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudo crear la etiqueta");
    } finally {
      setIsCreating(false);
    }
  };

  const handleQuerySubmit = async () => {
    if (!canAddMore) return;
    if (exactTagMatch && !selectedTagIds.includes(exactTagMatch._id)) {
      onTagToggle(exactTagMatch._id);
      setSearchQuery("");
      setError(null);
      return;
    }
    if (canCreateFromQuery) {
      await handleCreateTag();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs font-medium">Etiquetas</Label>
        <span className="text-xs text-muted-foreground tabular-nums">
          {selectedTagIds.length}/{maxTags}
        </span>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[32px]">
        {selectedTagIds.length > 0 ? (
          selectedTagIds.map((tagId) => {
            const tag = availableTags.find((t) => t._id === tagId);
            return tag ? (
              <TagBadge
                key={tag._id}
                name={tag.name}
                color={tag.color as ColorClass}
                size="md"
                onRemove={() => onTagToggle(tag._id)}
              />
            ) : null;
          })
        ) : (
          <span className="text-muted-foreground text-xs">Sin etiquetas</span>
        )}
      </div>

      <div className="space-y-3 rounded-md border border-border/70 bg-muted/20 p-3">
        <div className="relative">
          <LuSearch className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              if (error) setError(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void handleQuerySubmit();
              }
            }}
            placeholder="Buscar o crear etiqueta"
            className="h-8 pl-8 text-xs"
            disabled={!canAddMore && searchQuery.trim().length === 0}
          />
        </div>

        {filteredTags.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {filteredTags.map((tag) => (
              <button
                key={tag._id}
                type="button"
                onClick={() => {
                  if (!canAddMore) return;
                  onTagToggle(tag._id);
                  setSearchQuery("");
                }}
                className="cursor-pointer"
                disabled={!canAddMore}
              >
                <TagBadge
                  name={tag.name}
                  color={tag.color as ColorClass}
                  size="md"
                  className="hover:brightness-95"
                />
              </button>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            {query.length === 0
              ? "Escribe para filtrar etiquetas existentes"
              : "No hay coincidencias para esa busqueda"}
          </p>
        )}

        {canCreateFromQuery ? (
          <div className="space-y-2 rounded-md border border-dashed border-border px-2.5 py-2">
            <p className="text-xs text-muted-foreground">Crear "{searchQuery.trim()}"</p>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewTagColor(color)}
                    className={`h-5 w-5 rounded-full transition-transform cursor-pointer ${newTagColor === color ? "ring-2 ring-primary ring-offset-1 scale-110" : "ring-1 ring-border"} ${color === "red" ? "bg-red-500" : ""}${color === "blue" ? "bg-blue-500" : ""}${color === "green" ? "bg-green-500" : ""}${color === "yellow" ? "bg-yellow-500" : ""}${color === "purple" ? "bg-purple-500" : ""}${color === "pink" ? "bg-pink-500" : ""}${color === "orange" ? "bg-orange-500" : ""}${color === "cyan" ? "bg-cyan-500" : ""}${color === "slate" ? "bg-slate-500" : ""}${color === "indigo" ? "bg-indigo-500" : ""}`}
                    aria-label={`Usar color ${color}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={() => void handleCreateTag()}
                className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border bg-background px-2 text-xs font-medium transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                disabled={isCreating || !canAddMore}
              >
                {isCreating ? (
                  <LuCheck className="h-3.5 w-3.5" />
                ) : (
                  <LuPlus className="h-3.5 w-3.5" />
                )}
                {isCreating ? "Creando..." : "Crear etiqueta"}
              </button>
            </div>
          </div>
        ) : null}

        {error ? <p className="text-xs text-destructive">{error}</p> : null}
      </div>

      {!canAddMore && (
        <p className="text-xs text-muted-foreground">
          Alcanzaste el maximo de {maxTags} etiquetas. Quita una para agregar otra.
        </p>
      )}
    </div>
  );
}
