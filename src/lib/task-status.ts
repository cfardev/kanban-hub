export const TASK_STATUSES = ["por_empezar", "en_curso", "terminado"] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "por_empezar", label: "Por Empezar" },
  { value: "en_curso", label: "En curso" },
  { value: "terminado", label: "Terminado" },
];
