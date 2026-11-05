// Kanban Hub MCP server (stdio): `node mcp/server.ts`. Setup in README "MCP server".
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ConvexHttpClient } from "convex/browser";
import { z } from "zod";
import { api } from "../convex/_generated/api.js";
import type { Id } from "../convex/_generated/dataModel.js";

const { KANBAN_URL, CONVEX_URL, KANBAN_TOKEN } = process.env;
if (!KANBAN_URL || !CONVEX_URL || !KANBAN_TOKEN) {
  console.error("Missing env: KANBAN_URL, CONVEX_URL and KANBAN_TOKEN are required");
  process.exit(1);
}

const convex = new ConvexHttpClient(CONVEX_URL);

// Convex JWTs are short-lived, so trade the session token for a fresh one on every call.
async function client() {
  const res = await fetch(new URL("/api/auth/convex/token", KANBAN_URL), {
    headers: { Authorization: `Bearer ${KANBAN_TOKEN}` },
  });
  const body = (await res.json().catch(() => null)) as { token?: string } | null;
  if (!res.ok || !body?.token) {
    throw new Error(`Auth failed (${res.status}). Copy a new MCP token from your profile.`);
  }
  convex.setAuth(body.token);
  return convex;
}

const json = (value: unknown) => ({
  content: [{ type: "text" as const, text: JSON.stringify(value, null, 2) }],
});

const status = z
  .enum(["por_empezar", "en_curso", "terminado"])
  .describe("por_empezar = por hacer, en_curso = en progreso, terminado = hecho");
const boardId = z.string().describe("ID del tablero (de list_boards)");
const taskId = z.string().describe("ID de la tarea (de get_board)");
const tagIds = z.array(z.string()).max(3).describe("IDs de etiquetas del tablero, máximo 3");

const server = new McpServer({ name: "kanban-hub", version: "0.1.0" });

server.registerTool(
  "list_boards",
  { description: "Lista los tableros del usuario (propios y compartidos)." },
  async () => json(await (await client()).query(api.boards.list, {}))
);

server.registerTool(
  "get_board",
  {
    description: "Devuelve un tablero con sus tareas, etiquetas y participantes (para asignar).",
    inputSchema: { boardId },
  },
  async (args) => {
    const c = await client();
    const id = args.boardId as Id<"boards">;
    const [board, tasks, tags, participantIds] = await Promise.all([
      c.query(api.boards.getById, { id }),
      c.query(api.tasks.listByBoard, { boardId: id }),
      c.query(api.tags.listByBoard, { boardId: id }),
      c.query(api.boards.listParticipants, { boardId: id }),
    ]);
    if (!board) throw new Error("Tablero no encontrado");
    const participants = await c.action(api.auth.getUsersPublicInfo, { userIds: participantIds });
    return json({ board, tasks, tags, participants });
  }
);

server.registerTool(
  "create_task",
  {
    description: "Crea una tarea en un tablero.",
    inputSchema: {
      boardId,
      title: z.string().min(1),
      description: z.string().optional(),
      status: status.optional(),
      assigneeId: z.string().optional().describe("ID de un participante (de get_board)"),
      tagIds: tagIds.optional(),
    },
  },
  async (args) => {
    const id = await (await client()).mutation(api.tasks.create, {
      boardId: args.boardId as Id<"boards">,
      title: args.title,
      description: args.description,
      status: args.status,
      assignee_id: args.assigneeId,
      tags: args.tagIds as Id<"tags">[] | undefined,
    });
    return json({ taskId: id });
  }
);

server.registerTool(
  "update_task",
  {
    description:
      "Edita una tarea: título, descripción, estado (moverla de columna), responsable o etiquetas.",
    inputSchema: {
      taskId,
      title: z.string().min(1).optional(),
      description: z.string().optional(),
      status: status.optional(),
      assigneeId: z.string().optional(),
      tagIds: tagIds.optional(),
    },
  },
  async (args) => {
    await (await client()).mutation(api.tasks.update, {
      id: args.taskId as Id<"tasks">,
      title: args.title,
      description: args.description,
      status: args.status,
      assignee_id: args.assigneeId,
      tags: args.tagIds as Id<"tags">[] | undefined,
    });
    return json({ ok: true });
  }
);

server.registerTool(
  "delete_task",
  { description: "Elimina una tarea.", inputSchema: { taskId } },
  async (args) => {
    await (await client()).mutation(api.tasks.remove, { id: args.taskId as Id<"tasks"> });
    return json({ ok: true });
  }
);

server.registerTool(
  "add_subtask",
  {
    description: "Agrega una subtarea a una tarea.",
    inputSchema: { boardId, taskId, title: z.string().min(1) },
  },
  async (args) => {
    const id = await (await client()).mutation(api.subtasks.create, {
      boardId: args.boardId as Id<"boards">,
      taskId: args.taskId as Id<"tasks">,
      title: args.title,
    });
    return json({ subtaskId: id });
  }
);

server.registerTool(
  "add_comment",
  {
    description: "Agrega un comentario a una tarea.",
    inputSchema: { boardId, taskId, content: z.string().min(1) },
  },
  async (args) => {
    const id = await (await client()).mutation(api.comments.create, {
      boardId: args.boardId as Id<"boards">,
      taskId: args.taskId as Id<"tasks">,
      content: args.content,
    });
    return json({ commentId: id });
  }
);

await server.connect(new StdioServerTransport());
