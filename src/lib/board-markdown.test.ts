import { describe, expect, it } from "vitest";
import { formatBoardAsMarkdown } from "./board-markdown";

const task = (overrides: Record<string, unknown>) =>
  ({
    _id: "task-1",
    _creationTime: 0,
    board_id: "board-1",
    title: "Preparar lanzamiento",
    status: "por_empezar",
    position: 0,
    created_at: 1,
    updated_at: 1,
    ...overrides,
  }) as never;

const tag = (overrides: Record<string, unknown>) =>
  ({
    _id: "tag-1",
    _creationTime: 0,
    board_id: "board-1",
    name: "frontend",
    color: "blue",
    created_at: 1,
    ...overrides,
  }) as never;

describe("formatBoardAsMarkdown", () => {
  it("groups all tasks in visual status and position order", () => {
    const markdown = formatBoardAsMarkdown({
      board: { name: "Lanzamiento" },
      tasks: [
        task({ _id: "done", title: "Publicar", status: "terminado", position: 0 }),
        task({ _id: "later", title: "Documentar", position: 2, created_at: 3 }),
        task({ _id: "first", title: "Planificar", position: 1, created_at: 2 }),
        task({ _id: "progress", title: "Construir", status: "en_curso", position: 0 }),
      ],
      tags: [],
      participantsInfoMap: {},
    });

    expect(markdown).toMatchInlineSnapshot(`
      "# Lanzamiento

      ## Por Empezar

      ### Planificar

      - **Responsable:** Sin asignar

      ### Documentar

      - **Responsable:** Sin asignar

      ## En curso

      ### Construir

      - **Responsable:** Sin asignar

      ## Terminado

      ### Publicar

      - **Responsable:** Sin asignar"
    `);
  });

  it("includes descriptions, resolved task metadata, and empty columns", () => {
    const markdown = formatBoardAsMarkdown({
      board: { name: "Board", description: "Trabajo de esta semana" },
      tasks: [
        task({
          title: "Definir `API`",
          description: "Primera linea\nSegunda linea",
          assignee_id: "user-1",
          tags: ["tag-1", "missing-tag"],
        }),
      ],
      tags: [tag({ name: "release`2026" })],
      participantsInfoMap: { "user-1": { name: "Ana Pérez", image: null } },
    });

    expect(markdown).toContain("> Trabajo de esta semana");
    expect(markdown).toContain("### Definir \\`API\\`");
    expect(markdown).toContain("> Primera linea\n> Segunda linea");
    expect(markdown).toContain("- **Responsable:** Ana Pérez");
    expect(markdown).toContain("- **Etiquetas:** `release\\`2026`");
    expect(markdown).toContain("## En curso\n\n_Sin tareas._");
  });

  it("keeps tasks with unknown statuses in a final section", () => {
    const markdown = formatBoardAsMarkdown({
      board: { name: "Board" },
      tasks: [task({ title: "Archivada", status: "archivada" })],
      tags: [],
      participantsInfoMap: {},
    });

    expect(markdown).toContain("## Otros\n\n### Archivada");
  });
});
