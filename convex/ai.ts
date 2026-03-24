import { ConvexError, v } from "convex/values";
import { api, components } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import type { ActionCtx, MutationCtx, QueryCtx } from "./_generated/server";
import { action, mutation } from "./_generated/server";

const VALID_STATUSES = ["por_empezar", "en_curso", "terminado"] as const;
const DEFAULT_MODEL = "deepseek/deepseek-v3.2";
const FALLBACK_MODELS = [
  "deepseek/deepseek-v3.2",
  "openai/gpt-oss-20b:free",
  "openai/gpt-oss-120b:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "qwen/qwen3-4b:free",
] as const;
const MODEL_ALIASES: Record<string, string> = {
  "qwen/qwen3-32b:free": "qwen/qwen3-4b:free",
};
const MAX_SUGGESTIONS = 10;

type TaskStatus = (typeof VALID_STATUSES)[number];

type ParticipantOption = {
  id: string;
  name: string;
};

type SuggestedTask = {
  title: string;
  description?: string;
  status: TaskStatus;
  assignee_id?: string;
  assignee_name?: string;
  tags?: Id<"tags">[];
  tag_names: string[];
  warnings: string[];
};

function isValidStatus(value: string): value is TaskStatus {
  return VALID_STATUSES.includes(value as TaskStatus);
}

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function resolvePreferredModel(rawModel?: string): string {
  const candidate = rawModel?.trim();
  if (!candidate) return DEFAULT_MODEL;
  return MODEL_ALIASES[candidate] ?? candidate;
}

function extractJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new ConvexError("La IA no devolvió contenido para procesar");
  }

  try {
    return JSON.parse(trimmed);
  } catch {
    // Continue to fallback strategies
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {
      // Continue
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    const candidate = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(candidate);
    } catch {
      // Continue
    }
  }

  throw new ConvexError("No se pudo interpretar la respuesta de la IA");
}

async function requireIdentity(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) {
    throw new ConvexError("Debes iniciar sesión");
  }
  return identity;
}

async function assertBoardAccess(
  ctx: QueryCtx | MutationCtx,
  boardId: Id<"boards">,
  userId: string
) {
  const board = await ctx.db.get(boardId);
  if (!board?.active) throw new ConvexError("Tablero no encontrado");
  if (board.owner_id === userId) return board;
  const member = await ctx.db
    .query("board_members")
    .withIndex("by_board_and_user", (q) => q.eq("board_id", boardId).eq("user_id", userId))
    .unique();
  if (member === null) throw new ConvexError("Tablero no encontrado");
  return board;
}

async function getBoardParticipants(
  ctx: ActionCtx,
  boardId: Id<"boards">,
  ownerId?: string
): Promise<ParticipantOption[]> {
  const ids = new Set<string>();
  if (ownerId) ids.add(ownerId);
  const members = await ctx.runQuery(api.boards.listParticipants, { boardId });
  for (const memberId of members) ids.add(memberId);

  const participants = await Promise.all(
    [...ids].map(async (id) => {
      const doc = await ctx.runQuery(components.betterAuth.adapter.findOne, {
        model: "user",
        where: [{ field: "_id", operator: "eq", value: id }],
      });
      const name = (doc as { name?: string | null } | null)?.name?.trim();
      return {
        id,
        name: name && name.length > 0 ? name : id,
      };
    })
  );

  return participants;
}

function mapAssistantOutputToSuggestions(
  payload: unknown,
  participants: ParticipantOption[],
  tags: { _id: Id<"tags">; name: string }[]
): SuggestedTask[] {
  const participantByName = new Map<string, ParticipantOption>();
  for (const participant of participants) {
    participantByName.set(participant.name.toLowerCase(), participant);
  }

  const tagByName = new Map<string, { _id: Id<"tags">; name: string }>();
  for (const tag of tags) {
    tagByName.set(tag.name.toLowerCase(), tag);
  }

  const rawTasks =
    typeof payload === "object" && payload !== null && "tasks" in payload
      ? (payload as { tasks?: unknown }).tasks
      : null;

  if (!Array.isArray(rawTasks)) {
    throw new ConvexError("La IA no devolvió una lista de tareas válida");
  }

  const suggestions: SuggestedTask[] = [];

  for (const rawTask of rawTasks.slice(0, MAX_SUGGESTIONS)) {
    if (typeof rawTask !== "object" || rawTask === null) continue;

    const title = normalizeText((rawTask as { title?: unknown }).title);
    if (!title) continue;

    const description = normalizeText((rawTask as { description?: unknown }).description);
    const statusCandidate = normalizeText((rawTask as { status?: unknown }).status);
    const status = isValidStatus(statusCandidate) ? statusCandidate : "por_empezar";

    const warnings: string[] = [];
    const assigneeRaw = normalizeText((rawTask as { assignee?: unknown }).assignee);
    let assigneeId: string | undefined;
    let assigneeName: string | undefined;

    if (assigneeRaw) {
      const match = participantByName.get(assigneeRaw.toLowerCase());
      if (match) {
        assigneeId = match.id;
        assigneeName = match.name;
      } else {
        warnings.push(`No se encontró responsable: ${assigneeRaw}`);
      }
    }

    const rawTags = (rawTask as { tags?: unknown }).tags;
    const tagNames = Array.isArray(rawTags)
      ? rawTags.map((value) => normalizeText(value)).filter(Boolean)
      : [];
    const tagIds: Id<"tags">[] = [];
    const resolvedTagNames: string[] = [];

    for (const tagName of tagNames) {
      const match = tagByName.get(tagName.toLowerCase());
      if (!match) {
        warnings.push(`No se encontró etiqueta: ${tagName}`);
        continue;
      }
      if (tagIds.includes(match._id)) continue;
      if (tagIds.length >= 3) {
        warnings.push("Se ignoraron etiquetas extra (máximo 3)");
        break;
      }
      tagIds.push(match._id);
      resolvedTagNames.push(match.name);
    }

    suggestions.push({
      title: title.slice(0, 120),
      description: description ? description.slice(0, 1200) : undefined,
      status,
      assignee_id: assigneeId,
      assignee_name: assigneeName,
      tags: tagIds.length > 0 ? tagIds : undefined,
      tag_names: resolvedTagNames,
      warnings,
    });
  }

  if (suggestions.length === 0) {
    throw new ConvexError("No se pudieron generar tareas útiles");
  }

  return suggestions;
}

export const generateTaskSuggestions = action({
  args: {
    boardId: v.id("boards"),
    prompt: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new ConvexError("Debes iniciar sesión");
    }

    const board = await ctx.runQuery(api.boards.getById, { id: args.boardId });
    if (!board?.active) {
      throw new ConvexError("Tablero no encontrado");
    }

    const userPrompt = args.prompt.trim();
    if (userPrompt.length < 10) {
      throw new ConvexError("Describe un poco más lo que necesitas");
    }

    const openRouterApiKey = process.env.OPENROUTER_API_KEY;
    if (!openRouterApiKey) {
      throw new ConvexError("Falta configurar OPENROUTER_API_KEY en el servidor");
    }

    const participants = await getBoardParticipants(ctx, args.boardId, board.owner_id ?? undefined);
    const boardTags = await ctx.runQuery(api.tags.listByBoard, { boardId: args.boardId });

    const participantNames = participants.map((p) => p.name);
    const availableTagNames = boardTags.map((tag) => tag.name);

    const systemPrompt = [
      "Eres un asistente que convierte instrucciones en tareas de Kanban.",
      "Devuelve SOLO JSON válido (sin markdown) con la forma:",
      '{"tasks":[{"title":"string","description":"string opcional","status":"por_empezar|en_curso|terminado","assignee":"nombre exacto o vacío","tags":["nombre etiqueta"]}]}',
      `Máximo ${MAX_SUGGESTIONS} tareas.`,
      "No inventes nombres de responsables ni etiquetas.",
      "Si no aplica, usa assignee vacío y tags vacías.",
    ].join("\n");

    const contextPrompt = [
      `Tablero: ${board.name}`,
      `Responsables disponibles: ${participantNames.length > 0 ? participantNames.join(", ") : "ninguno"}`,
      `Etiquetas disponibles: ${availableTagNames.length > 0 ? availableTagNames.join(", ") : "ninguna"}`,
      "Solicitud del usuario:",
      userPrompt,
    ].join("\n");

    const preferredModel = resolvePreferredModel(process.env.OPENROUTER_MODEL);
    const modelChain = [
      preferredModel,
      ...FALLBACK_MODELS.filter((model) => model !== preferredModel),
    ];

    let lastError = "No se recibió respuesta del proveedor";
    let body:
      | {
          choices?: Array<{
            message?: { content?: string };
          }>;
          model?: string;
        }
      | undefined;

    for (const [index, model] of modelChain.entries()) {
      let response: Response | null = null;
      for (let attempt = 0; attempt < 2; attempt++) {
        response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${openRouterApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: contextPrompt },
            ],
            temperature: 0.3,
          }),
        });

        if (response.ok || response.status !== 429 || attempt === 1) {
          break;
        }

        await new Promise((resolve) => setTimeout(resolve, 350 * (attempt + 1)));
      }

      if (!response) {
        continue;
      }

      if (response.ok) {
        body = (await response.json()) as {
          choices?: Array<{
            message?: { content?: string };
          }>;
          model?: string;
        };
        break;
      }

      const bodyText = await response.text();
      lastError = `OpenRouter devolvió error (${response.status}). ${bodyText.slice(0, 200)}`;

      const isRecoverable400 =
        response.status === 400 &&
        (bodyText.includes("Developer instruction is not enabled") ||
          bodyText.includes("Unsupported value") ||
          bodyText.includes("unsupported") ||
          bodyText.includes("not enabled for models"));

      const shouldTryFallback =
        (response.status === 404 ||
          response.status === 429 ||
          response.status >= 500 ||
          isRecoverable400) &&
        index < modelChain.length - 1;

      if (shouldTryFallback) {
        await new Promise((resolve) => setTimeout(resolve, 250));
        continue;
      }

      throw new ConvexError(lastError);
    }

    if (!body) {
      throw new ConvexError(lastError);
    }

    const content = body.choices?.[0]?.message?.content ?? "";
    const parsed = extractJsonObject(content);
    const suggestions = mapAssistantOutputToSuggestions(parsed, participants, boardTags);

    return {
      model: body.model ?? process.env.OPENROUTER_MODEL ?? DEFAULT_MODEL,
      suggestions,
    };
  },
});

export const createTasksFromSuggestions = mutation({
  args: {
    boardId: v.id("boards"),
    suggestions: v.array(
      v.object({
        title: v.string(),
        description: v.optional(v.string()),
        status: v.optional(v.string()),
        assignee_id: v.optional(v.string()),
        tags: v.optional(v.array(v.id("tags"))),
      })
    ),
  },
  handler: async (ctx, args) => {
    const identity = await requireIdentity(ctx);
    await assertBoardAccess(ctx, args.boardId, identity.subject);

    if (args.suggestions.length === 0) {
      throw new ConvexError("No hay tareas para crear");
    }

    const createdTaskIds: Id<"tasks">[] = [];

    for (const suggestion of args.suggestions.slice(0, MAX_SUGGESTIONS)) {
      const title = suggestion.title.trim();
      if (!title) continue;

      const status =
        suggestion.status && isValidStatus(suggestion.status) ? suggestion.status : undefined;

      const taskId = await ctx.runMutation(api.tasks.create, {
        boardId: args.boardId,
        title,
        description: suggestion.description?.trim() || undefined,
        status,
        assignee_id: suggestion.assignee_id,
        tags: suggestion.tags,
      });

      createdTaskIds.push(taskId);
    }

    if (createdTaskIds.length === 0) {
      throw new ConvexError("No se pudieron crear tareas");
    }

    return {
      created: createdTaskIds.length,
      taskIds: createdTaskIds,
    };
  },
});
