import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { TaskDialog } from "./task-dialog";

const { useMutationMock, useQueryMock, createTaskMock, updateTaskMock, removeTaskMock } =
  vi.hoisted(() => ({
    useMutationMock: vi.fn(),
    useQueryMock: vi.fn(),
    createTaskMock: vi.fn(),
    updateTaskMock: vi.fn(),
    removeTaskMock: vi.fn(),
  }));

vi.mock("convex/react", () => ({
  useMutation: useMutationMock,
  useQuery: useQueryMock,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    tasks: {
      create: "tasks.create",
      update: "tasks.update",
      remove: "tasks.remove",
    },
    subtasks: {
      listByTask: "subtasks.listByTask",
    },
  },
}));

vi.mock("@/components/tag-selector", () => ({
  TagSelector: () => <div>TagSelector</div>,
}));

vi.mock("@/components/subtask/subtask-list", () => ({
  SubtaskList: () => <div>Subtasks</div>,
}));

vi.mock("@/components/ui/sheet", () => ({
  Sheet: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SheetTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({ children }: { children: ReactNode }) => (
    <button type="button">{children}</button>
  ),
  AlertDialogAction: ({ children, onClick }: { children: ReactNode; onClick?: () => void }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/select", () => ({
  Select: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectItem: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectTrigger: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  SelectValue: () => <div>SelectValue</div>,
}));

describe("TaskDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useMutationMock.mockImplementation((mutation: string) => {
      if (mutation === "tasks.create") return createTaskMock;
      if (mutation === "tasks.update") return updateTaskMock;
      if (mutation === "tasks.remove") return removeTaskMock;
      return vi.fn();
    });
    useQueryMock.mockReturnValue([]);
  });

  it("creates a task in create mode", async () => {
    const onOpenChange = vi.fn();

    render(
      <TaskDialog
        open
        onOpenChange={onOpenChange}
        task={null}
        boardId={"board-1" as never}
        participantIds={["u1"]}
        participantsInfo={[]}
        availableTags={[]}
      />
    );

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "  Nueva tarea  " } });
    fireEvent.change(screen.getByLabelText("Descripción"), {
      target: { value: "  detalle  " },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear" }));

    await waitFor(() => {
      expect(createTaskMock).toHaveBeenCalledWith({
        boardId: "board-1",
        title: "Nueva tarea",
        description: "detalle",
        assignee_id: undefined,
        tags: undefined,
      });
    });
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("updates and deletes task in edit mode", async () => {
    const onOpenChange = vi.fn();
    const task = {
      _id: "task-1",
      title: "Original",
      description: "Desc",
      status: "por_empezar",
      assignee_id: null,
      tags: [],
    } as never;

    render(
      <TaskDialog
        open
        onOpenChange={onOpenChange}
        task={task}
        boardId={"board-1" as never}
        participantIds={["u1"]}
        participantsInfo={[]}
        availableTags={[]}
      />
    );

    fireEvent.change(screen.getByLabelText("Título"), { target: { value: "Actualizada" } });
    fireEvent.click(screen.getByRole("button", { name: "Guardar" }));

    await waitFor(() => {
      expect(updateTaskMock).toHaveBeenCalledWith({
        id: "task-1",
        title: "Actualizada",
        description: "Desc",
        assignee_id: undefined,
        tags: undefined,
      });
    });

    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Eliminar" })[1]);

    await waitFor(() => {
      expect(removeTaskMock).toHaveBeenCalledWith({ id: "task-1" });
    });
  });
});
