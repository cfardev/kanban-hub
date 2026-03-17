"use client";

import { AddCommentForm } from "@/components/comments/add-comment-form";
import { CommentItem } from "@/components/comments/comment-item";
import { api } from "@/convex/_generated/api";
import type { Doc, Id } from "@/convex/_generated/dataModel";
import { useMutation, useQuery } from "convex/react";
import { MessageSquare } from "lucide-react";
import { motion } from "motion/react";

type Comment = {
  _id: string;
  author_id: string;
  content: string;
  created_at: number;
  updated_at: number;
};

type CommentListProps = {
  boardId: Id<"boards">;
  taskId: Id<"tasks">;
  participantsInfo: Record<string, { name: string | null; image: string | null }>;
};

export function CommentList({ boardId, taskId, participantsInfo }: CommentListProps) {
  const comments = useQuery(api.comments.listByTask, { boardId, taskId });
  const currentUser = useQuery(api.auth.getCurrentUser);
  const createComment = useMutation(api.comments.create);
  const updateComment = useMutation(api.comments.update);
  const removeComment = useMutation(api.comments.remove);

  const handleAddComment = async (content: string) => {
    await createComment({
      boardId,
      taskId,
      content,
    });
  };

  const handleEditComment = async (commentId: string, content: string) => {
    await updateComment({
      id: commentId as Id<"comments">,
      content,
    });
  };

  const handleDeleteComment = async (commentId: string) => {
    await removeComment({
      id: commentId as Id<"comments">,
      boardId,
    });
  };

  if (!comments) {
    return <div className="animate-pulse">Cargando comentarios...</div>;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b pb-3">
        <MessageSquare className="size-4 text-muted-foreground" />
        <h3 className="text-sm font-medium">Comentarios</h3>
        <span className="ml-auto text-xs text-muted-foreground">{comments.length}</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {comments.length > 0 ? (
          <div className="space-y-4 py-4">
            {comments.map((comment) => {
              const authorInfo = participantsInfo[comment.author_id];
              return (
                <CommentItem
                  key={comment._id}
                  comment={comment}
                  authorName={authorInfo?.name ?? null}
                  authorImage={authorInfo?.image ?? null}
                  currentUserId={currentUser?.subject || ""}
                  onEdit={handleEditComment}
                  onDelete={handleDeleteComment}
                />
              );
            })}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 text-center"
          >
            <MessageSquare className="size-12 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">Aún no hay comentarios</p>
            <p className="mt-1 text-xs text-muted-foreground/70">Sé el primero en comentar</p>
          </motion.div>
        )}
      </div>

      <div className="border-t pt-4">
        <AddCommentForm onSubmit={handleAddComment} disabled={!currentUser} />
      </div>
    </div>
  );
}
