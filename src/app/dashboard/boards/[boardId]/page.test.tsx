import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import BoardPage from "./page";

const {
  useParamsMock,
  useRouterMock,
  useQueryMock,
  useActionMock,
  useMutationMock,
  replaceMock,
  getUsersPublicInfoMock,
  kanbanBoardMock,
  taskDialogMock,
  writeTextMock,
} = vi.hoisted(() => ({
  useParamsMock: vi.fn(),
  useRouterMock: vi.fn(),
  useQueryMock: vi.fn(),
  useActionMock: vi.fn(),
  useMutationMock: vi.fn(),
  replaceMock: vi.fn(),
  getUsersPublicInfoMock: vi.fn(),
  kanbanBoardMock: vi.fn(),
  taskDialogMock: vi.fn(),
  writeTextMock: vi.fn(),
}));

let boardResult: unknown;
let tasksResult: unknown;
let tagsResult: unknown;
let participantIdsResult: unknown;
let currentUserResult: unknown;

vi.mock("next/navigation", () => ({
  useParams: useParamsMock,
  useRouter: useRouterMock,
}));

vi.mock("convex/react", () => ({
  useQuery: useQueryMock,
  useAction: useActionMock,
  useMutation: useMutationMock,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    boards: {
      getById: "boards.getById",
      listParticipants: "boards.listParticipants",
    },
    tasks: {
      listByBoard: "tasks.listByBoard",
    },
    tags: {
      listByBoard: "tags.listByBoard",
    },
    auth: {
      getCurrentUser: "auth.getCurrentUser",
      getUsersPublicInfo: "auth.getUsersPublicInfo",
    },
    ai: {
      generateTaskSuggestions: "ai.generateTaskSuggestions",
      createTasksFromSuggestions: "ai.createTasksFromSuggestions",
    },
  },
}));

vi.mock("@/components/logo", () => ({ Logo: () => <div>Logo</div> }));
vi.mock("@/components/theme-toggle", () => ({ ThemeToggle: () => <div>Theme</div> }));
vi.mock("@/components/avatar-dropdown", () => ({ AvatarDropdown: () => <div>Avatar</div> }));
vi.mock("@/components/invitation-notifications", () => ({
  InvitationNotifications: () => <div>Invitations</div>,
}));
vi.mock("@/components/board-presence-avatars", () => ({
  BoardPresenceAvatars: () => <div>Presence</div>,
}));
vi.mock("@/components/share-board-dialog", () => ({
  ShareBoardDialog: ({ open }: { open: boolean }) => (open ? <div>ShareDialogOpen</div> : null),
}));
vi.mock("@/components/activity/activity-dialog", () => ({
  ActivityDialog: ({ open }: { open: boolean }) => (open ? <div>ActivityOpen</div> : null),
}));
vi.mock("@/components/ai-task-assistant-dialog", () => ({
  AiTaskAssistantDialog: ({ open }: { open: boolean }) =>
    open ? <div>AiAssistantOpen</div> : null,
}));
vi.mock("@/components/task-dialog", () => ({
  TaskDialog: (props: { open: boolean }) => {
    taskDialogMock(props);
    return props.open ? <div>TaskDialogOpen</div> : null;
  },
}));
vi.mock("@/components/kanban-board", () => ({
  KanbanBoard: (props: { onNewTask: () => void }) => {
    kanbanBoardMock(props);
    return (
      <button type="button" onClick={props.onNewTask}>
        Nuevo task
      </button>
    );
  },
}));
vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    asChild,
    ...props
  }: { children: ReactNode; onClick?: () => void; asChild?: boolean }) =>
    asChild ? (
      <>{children}</>
    ) : (
      <button type="button" onClick={onClick} {...props}>
        {children}
      </button>
    ),
}));

describe("BoardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useParamsMock.mockReturnValue({ boardId: "board-1" });
    useRouterMock.mockReturnValue({ replace: replaceMock });

    boardResult = {
      _id: "board-1",
      owner_id: "owner-1",
      name: "Board uno",
      description: "desc",
    };
    tasksResult = [];
    tagsResult = [];
    participantIdsResult = ["owner-1", "u2"];
    currentUserResult = { subject: "owner-1" };

    useQueryMock.mockImplementation((query: string) => {
      if (query === "boards.getById") return boardResult;
      if (query === "tasks.listByBoard") return tasksResult;
      if (query === "tags.listByBoard") return tagsResult;
      if (query === "boards.listParticipants") return participantIdsResult;
      if (query === "auth.getCurrentUser") return currentUserResult;
      return undefined;
    });

    getUsersPublicInfoMock.mockResolvedValue([
      { _id: "owner-1", name: "Owner", image: null },
      { _id: "u2", name: "Guest", image: null },
    ]);
    useMutationMock.mockReturnValue(vi.fn());
    useActionMock.mockReturnValue(getUsersPublicInfoMock);
    writeTextMock.mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText: writeTextMock },
    });
  });

  it("redirects back to dashboard when board does not exist", async () => {
    boardResult = null;

    render(<BoardPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("shows participants button and opens task dialog", async () => {
    render(<BoardPage />);

    expect(await screen.findByRole("button", { name: "Participantes" })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Nuevo task" }));
    expect(screen.getByText("TaskDialogOpen")).toBeInTheDocument();
  });

  it("opens AI assistant dialog", async () => {
    render(<BoardPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Asistente IA" }));
    expect(screen.getByText("AiAssistantOpen")).toBeInTheDocument();
  });

  it("copies Markdown for every board task even when my tasks is active", async () => {
    tasksResult = [
      {
        _id: "task-1",
        _creationTime: 0,
        board_id: "board-1",
        title: "Tarea propia",
        status: "por_empezar",
        position: 0,
        assignee_id: "owner-1",
        created_at: 1,
        updated_at: 1,
      },
      {
        _id: "task-2",
        _creationTime: 0,
        board_id: "board-1",
        title: "Tarea del equipo",
        status: "en_curso",
        position: 0,
        assignee_id: "u2",
        created_at: 2,
        updated_at: 2,
      },
    ];

    render(<BoardPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Mis tareas" }));
    fireEvent.click(screen.getByRole("button", { name: "Copiar Markdown" }));

    await waitFor(() => {
      expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("### Tarea propia"));
    });
    expect(writeTextMock).toHaveBeenCalledWith(expect.stringContaining("### Tarea del equipo"));
    expect(await screen.findByRole("button", { name: "Copiado" })).toBeInTheDocument();
  });

  it("announces a clipboard failure", async () => {
    writeTextMock.mockRejectedValueOnce(new Error("Permission denied"));
    render(<BoardPage />);

    fireEvent.click(await screen.findByRole("button", { name: "Copiar Markdown" }));

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "No se pudo copiar el Markdown al portapapeles"
    );
  });

  it("filters tasks assigned to the current user and preassigns new tasks", async () => {
    render(<BoardPage />);

    const filterButton = await screen.findByRole("button", { name: "Mis tareas" });
    expect(filterButton).toHaveAttribute("aria-pressed", "false");

    fireEvent.click(filterButton);

    expect(filterButton).toHaveAttribute("aria-pressed", "true");
    expect(kanbanBoardMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ currentUserId: "owner-1", showOnlyMyTasks: true })
    );

    fireEvent.click(screen.getByRole("button", { name: "Nuevo task" }));
    expect(taskDialogMock).toHaveBeenLastCalledWith(
      expect.objectContaining({ defaultAssigneeId: "owner-1", open: true })
    );
  });
});
