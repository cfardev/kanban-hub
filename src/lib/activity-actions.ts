import {
  LuArrowRight,
  LuCheck,
  LuMessageSquare,
  LuPencil,
  LuPlus,
  LuTrash2,
  LuX,
} from "react-icons/lu";

export type ActivityAction =
  | "task_created"
  | "task_updated"
  | "task_moved"
  | "task_deleted"
  | "comment_added"
  | "comment_edited"
  | "comment_deleted"
  | "subtask_completed"
  | "subtask_deleted";

export function getActionIcon(action: ActivityAction): typeof LuPlus {
  switch (action) {
    case "task_created":
      return LuPlus;
    case "task_updated":
      return LuPencil;
    case "task_moved":
      return LuArrowRight;
    case "task_deleted":
      return LuTrash2;
    case "comment_added":
      return LuMessageSquare;
    case "comment_edited":
      return LuPencil;
    case "comment_deleted":
      return LuTrash2;
    case "subtask_completed":
      return LuCheck;
    case "subtask_deleted":
      return LuX;
    default:
      return LuPlus;
  }
}

export function getActionLabel(
  action: ActivityAction,
  userName?: string | null,
  details?: string | null
): string {
  const name = userName || "Alguien";

  switch (action) {
    case "task_created": {
      let taskTitle = "una tarea";
      if (details) {
        try {
          const parsed = JSON.parse(details);
          if (parsed.title) taskTitle = `"${parsed.title}"`;
        } catch (e) {}
      }
      return `${name} creó la tarea ${taskTitle}`;
    }

    case "task_updated":
      return `${name} actualizó la tarea`;

    case "task_moved": {
      let from = "";
      let to = "";
      if (details) {
        try {
          const parsed = JSON.parse(details);
          from = parsed.from || "";
          to = parsed.to || "";
        } catch (e) {}
      }
      return `${name} movió la tarea de "${from}" a "${to}"`;
    }

    case "task_deleted": {
      let deletedTitle = "una tarea";
      if (details) {
        try {
          const parsed = JSON.parse(details);
          if (parsed.title) deletedTitle = `"${parsed.title}"`;
        } catch (e) {}
      }
      return `${name} eliminó la tarea ${deletedTitle}`;
    }

    case "comment_added":
      return `${name} añadió un comentario`;

    case "comment_edited":
      return `${name} editó un comentario`;

    case "comment_deleted":
      return `${name} eliminó un comentario`;

    case "subtask_completed": {
      let subtaskTitle = "una subtarea";
      let completed = false;
      if (details) {
        try {
          const parsed = JSON.parse(details);
          if (parsed.title) subtaskTitle = `"${parsed.title}"`;
          if (typeof parsed.completed === "boolean") completed = parsed.completed;
        } catch (e) {}
      }
      return `${name} ${completed ? "completó" : "desmarcó"} la subtarea ${subtaskTitle}`;
    }

    case "subtask_deleted": {
      let deletedSubtaskTitle = "una subtarea";
      if (details) {
        try {
          const parsed = JSON.parse(details);
          if (parsed.title) deletedSubtaskTitle = `"${parsed.title}"`;
        } catch (e) {}
      }
      return `${name} eliminó la subtarea ${deletedSubtaskTitle}`;
    }

    default:
      return `${name} realizó una acción`;
  }
}

export function getActionColor(action: ActivityAction): string {
  switch (action) {
    case "task_created":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    case "task_updated":
      return "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950";
    case "task_moved":
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950";
    case "task_deleted":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    case "comment_added":
      return "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950";
    case "comment_edited":
      return "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950";
    case "comment_deleted":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    case "subtask_completed":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950";
    case "subtask_deleted":
      return "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950";
    default:
      return "text-slate-600 bg-slate-50 dark:text-slate-400 dark:bg-slate-950";
  }
}
