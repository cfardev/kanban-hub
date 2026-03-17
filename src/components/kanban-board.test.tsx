import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { KanbanBoard } from "./kanban-board";

const { useMutationMock, updateStatusAndPositionMock } = vi.hoisted(() => ({
  useMutationMock: vi.fn(),
  updateStatusAndPositionMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useMutation: useMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    tasks: {
      updateStatusAndPosition: "tasks.updateStatusAndPosition",
    },
  },
}));

vi.mock("@/components/kanban-column", () => ({
  KanbanColumn: ({ status }: { status: string }) => <div>{status}</div>,
}));

vi.mock("@/components/task-card-overlay", () => ({
  TaskCardOverlay: () => <div>Overlay</div>,
}));

vi.mock("@dnd-kit/core", () => ({
  DndContext: ({
    children,
    onDragEnd,
  }: {
    children: ReactNode;
    onDragEnd: (event: unknown) => void;
  }) => (
    <div>
      <button
        type="button"
        onClick={() => onDragEnd({ active: { id: "task-1" }, over: { id: "en_curso" } } as unknown)}
      >
        trigger-drag-end
      </button>
      {children}
    </div>
  ),
  DragOverlay: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  PointerSensor: class {},
  TouchSensor: class {},
  closestCorners: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn().mockReturnValue([]),
}));

describe("KanbanBoard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockReturnValue(updateStatusAndPositionMock);
  });

  it("updates status and position when dropped on column", () => {
    render(
      <KanbanBoard
        boardId="board-1"
        tasks={[
          {
            _id: "task-1",
            status: "por_empezar",
            position: 1,
            assignee_id: null,
          } as never,
          {
            _id: "task-2",
            status: "en_curso",
            position: 2,
            assignee_id: null,
          } as never,
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "trigger-drag-end" }));

    expect(updateStatusAndPositionMock).toHaveBeenCalledWith({
      id: "task-1",
      status: "en_curso",
      position: 3,
    });
  });
});
