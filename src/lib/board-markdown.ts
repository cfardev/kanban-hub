import type { Doc } from "@/convex/_generated/dataModel";
import { STATUS_OPTIONS } from "./task-status";

type Task = Doc<"tasks">;
type Tag = Doc<"tags">;

type BoardMarkdownInput = {
  board: Pick<Doc<"boards">, "name" | "description">;
  tasks: Task[];
  tags: Tag[];
  participantsInfoMap: Record<string, { name: string | null; image: string | null }>;
};

const escapeInline = (value: string) => value.replaceAll("`", "\\`").replace(/\s+/g, " ").trim();

const formatDescription = (description: string) =>
  description
    .trim()
    .split("\n")
    .map((line) => `> ${line}`)
    .join("\n");

const sortTasks = (tasks: Task[]) =>
  tasks.toSorted(
    (first, second) => first.position - second.position || first.created_at - second.created_at
  );

export function formatBoardAsMarkdown({
  board,
  tasks,
  tags,
  participantsInfoMap,
}: BoardMarkdownInput) {
  const tagNames = new Map(tags.map((tag) => [tag._id, tag.name]));
  const knownStatuses = new Set(STATUS_OPTIONS.map((status) => status.value));
  const sections = STATUS_OPTIONS.map(({ value, label }) => ({
    label,
    tasks: sortTasks(tasks.filter((task) => task.status === value)),
  }));
  const otherTasks = sortTasks(tasks.filter((task) => !knownStatuses.has(task.status as never)));

  if (otherTasks.length > 0) {
    sections.push({ label: "Otros", tasks: otherTasks });
  }

  const taskSections = sections.map(({ label, tasks: tasksInSection }) => {
    if (tasksInSection.length === 0) {
      return `## ${label}\n\n_Sin tareas._`;
    }

    const formattedTasks = tasksInSection.map((task) => {
      const assignee = task.assignee_id
        ? (participantsInfoMap[task.assignee_id]?.name ?? task.assignee_id)
        : "Sin asignar";
      const taskTags = task.tags
        ?.map((tagId) => tagNames.get(tagId))
        .filter((tagName): tagName is string => tagName !== undefined);
      const details = [`- **Responsable:** ${escapeInline(assignee)}`];

      if (taskTags && taskTags.length > 0) {
        details.push(
          `- **Etiquetas:** ${taskTags.map((tag) => `\`${escapeInline(tag)}\``).join(", ")}`
        );
      }

      return [
        `### ${escapeInline(task.title)}`,
        task.description ? formatDescription(task.description) : null,
        details.join("\n"),
      ]
        .filter(Boolean)
        .join("\n\n");
    });

    return `## ${label}\n\n${formattedTasks.join("\n\n")}`;
  });

  return [
    `# ${escapeInline(board.name)}`,
    board.description ? formatDescription(board.description) : null,
    taskSections.join("\n\n"),
  ]
    .filter(Boolean)
    .join("\n\n");
}
