"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { LuSend, LuX } from "react-icons/lu";

type AddCommentFormProps = {
  onSubmit: (content: string) => void;
  disabled: boolean;
};

export function AddCommentForm({ onSubmit, disabled }: AddCommentFormProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled) {
      onSubmit(trimmed);
      setValue("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setValue("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <div
        className={cn(
          "relative rounded-lg border bg-background transition-all",
          value && "ring-2 ring-ring",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Escribir un comentario..."
          disabled={disabled}
          className={cn(
            "w-full resize-y rounded-lg bg-transparent px-3 py-2 pr-20 text-sm focus:outline-none",
            "min-h-[60px]",
            disabled && "cursor-not-allowed"
          )}
          maxLength={1000}
          rows={1}
        />

        <div className="absolute bottom-2 right-2 flex items-center gap-2">
          {value && (
            <motion.button
              type="button"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="cursor-pointer rounded p-1 text-muted-foreground/50 hover:text-foreground transition-colors"
              onClick={() => setValue("")}
            >
              <LuX className="size-4" />
            </motion.button>
          )}

          <motion.button
            type="submit"
            disabled={!value.trim() || disabled}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={cn(
              "cursor-pointer rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground transition-colors",
              "hover:bg-primary/90",
              (!value.trim() || disabled) && "opacity-50 cursor-not-allowed"
            )}
          >
            <LuSend className="size-4" />
          </motion.button>
        </div>
      </div>

      {value.length >= 900 && (
        <p className="text-xs text-muted-foreground">{value.length}/1000 caracteres</p>
      )}

      <p className="text-xs text-muted-foreground">
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">Enter</kbd> para enviar,{" "}
        <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">Shift + Enter</kbd> para
        nueva línea, <kbd className="rounded border bg-muted px-1.5 py-0.5 text-[10px]">Escape</kbd>{" "}
        para cancelar
      </p>
    </form>
  );
}
