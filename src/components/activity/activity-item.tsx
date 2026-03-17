"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  type ActivityAction,
  getActionColor,
  getActionIcon,
  getActionLabel,
} from "@/lib/activity-actions";
import { formatRelativeTime } from "@/lib/format-time";
import { cn } from "@/lib/utils";

type ActivityLog = {
  _id: string;
  board_id: string;
  task_id?: string;
  user_id: string;
  action: string;
  details?: string;
  created_at: number;
};

type ActivityItemProps = {
  activity: ActivityLog;
  userName: string | null;
  userImage: string | null;
  onTaskClick?: (taskId: string) => void;
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

export function ActivityItem({ activity, userName, userImage, onTaskClick }: ActivityItemProps) {
  const ActionIcon = getActionIcon(activity.action as ActivityAction);
  const actionColor = getActionColor(activity.action as ActivityAction);
  const actionLabel = getActionLabel(activity.action as ActivityAction, userName, activity.details);

  return (
    <div className="flex gap-3">
      <Avatar className="size-8 shrink-0">
        {userImage ? <AvatarImage src={userImage} alt={userName || "Usuario"} /> : null}
        <AvatarFallback className="text-xs">{getInitials(userName)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 space-y-1">
        <div className="flex items-baseline gap-2">
          <div className={cn("flex size-5 items-center justify-center rounded-full", actionColor)}>
            <ActionIcon className="size-3" />
          </div>
          <p className="text-sm">{actionLabel}</p>
        </div>

        <span className="text-xs text-muted-foreground">
          {formatRelativeTime(activity.created_at)}
        </span>

        {activity.task_id && onTaskClick && (
          <button
            type="button"
            className="block text-xs text-primary hover:underline"
            onClick={() => activity.task_id && onTaskClick(activity.task_id)}
          >
            Ver tarea
          </button>
        )}
      </div>
    </div>
  );
}
