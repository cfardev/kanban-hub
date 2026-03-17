"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { useState } from "react";
import { LuPencil, LuTrash2, LuX } from "react-icons/lu";

type Comment = {
  _id: string;
  author_id: string;
  content: string;
  created_at: number;
  updated_at: number;
};

type CommentItemProps = {
  comment: Comment;
  authorName: string | null;
  authorImage: string | null;
  currentUserId: string;
  onEdit: (id: string, content: string) => void;
  onDelete: (id: string) => void;
};

function getInitials(name?: string | null): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name[0]?.toUpperCase() || "?";
  }
  return "?";
}

export function CommentItem({
  comment,
  authorName,
  authorImage,
  currentUserId,
  onEdit,
  onDelete,
}: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(comment.content);

  const isAuthor = comment.author_id === currentUserId;
  const wasEdited = comment.updated_at > comment.created_at;

  const handleSave = () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== comment.content) {
      onEdit(comment._id, trimmed);
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(comment.content);
    setIsEditing(false);
  };

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        {authorImage ? <AvatarImage src={authorImage} alt={authorName || "Usuario"} /> : null}
        <AvatarFallback className="text-xs">{getInitials(authorName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{authorName || "Usuario"}</span>
          <span className="text-xs text-muted-foreground">
            {formatRelativeTime(comment.created_at)}
          </span>
          {wasEdited && <span className="text-xs text-muted-foreground">(editado)</span>}
        </div>

        {isEditing ? (
          <div className="space-y-2">
            <textarea
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              className="min-h-[60px] w-full resize-y rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              maxLength={1000}
            />
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                className="cursor-pointer rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90"
              >
                Guardar
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleCancel}
                className="cursor-pointer rounded-md border px-3 py-1 text-xs font-medium hover:bg-muted"
              >
                <LuX className="size-3" />
              </motion.button>
            </div>
          </div>
        ) : (
          <p className="text-sm whitespace-pre-wrap break-words">{comment.content}</p>
        )}
      </div>

      {isAuthor && !isEditing && (
        <div className="flex gap-1">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "cursor-pointer rounded p-1 text-muted-foreground/50 transition-colors hover:text-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            onClick={() => setIsEditing(true)}
          >
            <LuPencil className="size-3.5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className={cn(
              "cursor-pointer rounded p-1 text-muted-foreground/50 transition-colors hover:text-destructive",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            )}
            onClick={() => onDelete(comment._id)}
          >
            <LuTrash2 className="size-3.5" />
          </motion.button>
        </div>
      )}
    </div>
  );
}
