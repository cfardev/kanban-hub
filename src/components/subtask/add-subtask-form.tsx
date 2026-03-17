"use client";

import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { LuPlus, LuX } from "react-icons/lu";

type AddSubtaskFormProps = {
  onAdd: (title: string) => void;
  disabled: boolean;
  isAtLimit: boolean;
};

export function AddSubtaskForm({ onAdd, disabled, isAtLimit }: AddSubtaskFormProps) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed && !disabled && !isAtLimit) {
      onAdd(trimmed);
      setValue("");
      setIsFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setValue("");
      setIsFocused(false);
    }
  };

  if (isAtLimit) {
    return (
      <div className="flex items-center justify-center rounded-md border border-dashed px-3 py-2 text-sm text-muted-foreground">
        <LuX className="mr-2 size-4" />
        <span>Máximo de 10 subtareas alcanzado</span>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "flex items-center gap-2 rounded-md border bg-card transition-all",
          isFocused && "ring-2 ring-ring",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      >
        <button
          type="button"
          disabled={disabled}
          className="ml-3 flex size-5 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/40 text-muted-foreground/40 transition-colors hover:border-emerald-600 hover:text-emerald-600 disabled:cursor-not-allowed"
          onClick={() => document.getElementById("subtask-input")?.focus()}
        >
          <LuPlus className="size-3" />
        </button>

        <input
          id="subtask-input"
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          placeholder="Añadir subtarea..."
          disabled={disabled}
          className="flex-1 bg-transparent py-2 text-sm focus:outline-none disabled:cursor-not-allowed"
          maxLength={100}
        />

        {value && (
          <motion.button
            type="button"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mr-3 cursor-pointer text-muted-foreground/50 hover:text-destructive transition-colors"
            onClick={() => {
              setValue("");
              setIsFocused(false);
            }}
          >
            <LuX className="size-4" />
          </motion.button>
        )}
      </div>

      {value.length >= 90 && (
        <p className="text-xs text-muted-foreground">{value.length}/100 caracteres</p>
      )}
    </div>
  );
}
