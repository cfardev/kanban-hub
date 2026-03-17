import { describe, expect, it } from "vitest";
import { STATUS_OPTIONS, TASK_STATUSES } from "./task-status";

describe("task-status", () => {
  it("keeps status constants and options aligned", () => {
    expect(TASK_STATUSES).toEqual(["por_empezar", "en_curso", "terminado"]);
    expect(STATUS_OPTIONS.map((option) => option.value)).toEqual(TASK_STATUSES);
  });
});
