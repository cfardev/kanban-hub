import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import DashboardPage from "./page";

const {
  useRouterMock,
  useQueryMock,
  useMutationMock,
  createBoardMock,
  updateBoardMock,
  removeBoardMock,
  leaveBoardMock,
  replaceMock,
} = vi.hoisted(() => ({
  useRouterMock: vi.fn(),
  useQueryMock: vi.fn(),
  useMutationMock: vi.fn(),
  createBoardMock: vi.fn(),
  updateBoardMock: vi.fn(),
  removeBoardMock: vi.fn(),
  leaveBoardMock: vi.fn(),
  replaceMock: vi.fn(),
}));

let userResult: unknown;
let boardsResult: unknown;

vi.mock("next/navigation", () => ({
  useRouter: useRouterMock,
}));

vi.mock("convex/react", () => ({
  useQuery: useQueryMock,
  useMutation: useMutationMock,
}));

vi.mock("@/components/logo", () => ({
  Logo: () => <div>Logo</div>,
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div>Theme</div>,
}));

vi.mock("@/components/avatar-dropdown", () => ({
  AvatarDropdown: () => <div>Avatar</div>,
}));

vi.mock("@/components/invitation-notifications", () => ({
  InvitationNotifications: () => <div>Invitations</div>,
}));

vi.mock("@/components/board-dialog", () => ({
  BoardDialog: ({ open, onSave }: { open: boolean; onSave: (data: { name: string }) => void }) =>
    open ? (
      <button type="button" onClick={() => onSave({ name: "Tablero nuevo" })}>
        Mock Guardar Board
      </button>
    ) : null,
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
  AlertDialogAction: ({
    children,
    onClick,
  }: {
    children: ReactNode;
    onClick?: () => void;
  }) => (
    <button type="button" onClick={onClick}>
      {children}
    </button>
  ),
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    auth: { getCurrentUser: "auth.getCurrentUser" },
    boards: {
      list: "boards.list",
      create: "boards.create",
      update: "boards.update",
      remove: "boards.remove",
      leaveBoard: "boards.leaveBoard",
    },
  },
}));

describe("DashboardPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useRouterMock.mockReturnValue({ replace: replaceMock });

    userResult = { subject: "u1" };
    boardsResult = [];

    useQueryMock.mockImplementation((query: string) => {
      if (query === "auth.getCurrentUser") return userResult;
      if (query === "boards.list") return boardsResult;
      return undefined;
    });

    useMutationMock.mockImplementation((mutation: string) => {
      if (mutation === "boards.create") return createBoardMock;
      if (mutation === "boards.update") return updateBoardMock;
      if (mutation === "boards.remove") return removeBoardMock;
      if (mutation === "boards.leaveBoard") return leaveBoardMock;
      return vi.fn();
    });
  });

  it("redirects to root when user query returns null", async () => {
    userResult = null;

    render(<DashboardPage />);

    await waitFor(() => {
      expect(replaceMock).toHaveBeenCalledWith("/");
    });
  });

  it("creates a board from dialog save action", async () => {
    render(<DashboardPage />);

    fireEvent.click(screen.getByRole("button", { name: "Nuevo tablero" }));
    fireEvent.click(screen.getByRole("button", { name: "Mock Guardar Board" }));

    await waitFor(() => {
      expect(createBoardMock).toHaveBeenCalledWith({
        name: "Tablero nuevo",
        description: undefined,
      });
    });
  });
});
