import { fireEvent, render, screen, waitFor } from "@testing-library/react";
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
  KanbanColumn: ({
    status,
    tasks,
    showCompletedCleanup,
    isPersonalFilterActive,
  }: {
    status: string;
    tasks: { _id: string }[];
    showCompletedCleanup: boolean;
    isPersonalFilterActive: boolean;
  }) => (
    <div data-testid={`column-${status}`}>
      {tasks.map((task) => task._id).join(",")}
      <span>{showCompletedCleanup ? "cleanup" : "no-cleanup"}</span>
      <span>{isPersonalFilterActive ? "personal" : "all"}</span>
    </div>
  ),
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

  it("updates status and position when dropped on column", async () => {
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

    await waitFor(() => {
      expect(updateStatusAndPositionMock).toHaveBeenCalledWith({
        id: "task-1",
        status: "en_curso",
        position: 3,
      });
    });
  });

  it("renders only the current user's tasks and hides global cleanup", () => {
    render(
      <KanbanBoard
        boardId="board-1"
        currentUserId="user-1"
        showOnlyMyTasks
        tasks={
          [
            { _id: "my-todo", status: "por_empezar", position: 1, assignee_id: "user-1" },
            { _id: "other-todo", status: "por_empezar", position: 2, assignee_id: "user-2" },
            { _id: "unassigned", status: "en_curso", position: 1 },
            { _id: "my-done", status: "terminado", position: 1, assignee_id: "user-1" },
          ] as never
        }
      />
    );

    expect(screen.getByTestId("column-por_empezar")).toHaveTextContent("my-todo");
    expect(screen.getByTestId("column-por_empezar")).not.toHaveTextContent("other-todo");
    expect(screen.getByTestId("column-en_curso")).not.toHaveTextContent("unassigned");
    expect(screen.getByTestId("column-terminado")).toHaveTextContent("my-done");
    expect(screen.getByTestId("column-terminado")).toHaveTextContent("no-cleanup");
    expect(screen.getByTestId("column-terminado")).toHaveTextContent("personal");
  });

  it("uses hidden tasks when calculating a filtered drop position", async () => {
    render(
      <KanbanBoard
        boardId="board-1"
        currentUserId="user-1"
        showOnlyMyTasks
        tasks={
          [
            { _id: "task-1", status: "por_empezar", position: 1, assignee_id: "user-1" },
            { _id: "hidden-task", status: "en_curso", position: 5, assignee_id: "user-2" },
          ] as never
        }
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "trigger-drag-end" }));

    await waitFor(() => {
      expect(updateStatusAndPositionMock).toHaveBeenCalledWith({
        id: "task-1",
        status: "en_curso",
        position: 6,
      });
    });
  });
});
