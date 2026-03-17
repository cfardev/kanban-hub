import { LuArrowRight, LuCheck, LuPlus, LuTrash2 } from "react-icons/lu";
import { describe, expect, it } from "vitest";
import { getActionColor, getActionIcon, getActionLabel } from "./activity-actions";

describe("activity-actions", () => {
  it("maps icons by action", () => {
    expect(getActionIcon("task_created")).toBe(LuPlus);
    expect(getActionIcon("task_moved")).toBe(LuArrowRight);
    expect(getActionIcon("subtask_completed")).toBe(LuCheck);
  });

  it("builds labels using details JSON when available", () => {
    expect(getActionLabel("task_created", "Ana", JSON.stringify({ title: "Fix login" }))).toBe(
      'Ana creó la tarea "Fix login"'
    );

    expect(
      getActionLabel("task_moved", "Ana", JSON.stringify({ from: "por_empezar", to: "en_curso" }))
    ).toBe('Ana movió la tarea de "por_empezar" a "en_curso"');
  });

  it("falls back gracefully on invalid details or missing user", () => {
    expect(getActionLabel("task_deleted", null, "not-json")).toBe(
      "Alguien eliminó la tarea una tarea"
    );
    expect(getActionLabel("subtask_completed", "Luis", null)).toBe(
      "Luis desmarcó la subtarea una subtarea"
    );
  });

  it("maps color classes for key actions", () => {
    expect(getActionColor("task_deleted")).toContain("text-red-600");
    expect(getActionColor("comment_deleted")).toContain("bg-red-50");
    expect(getActionIcon("task_deleted")).toBe(LuTrash2);
  });
});
