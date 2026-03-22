import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ShareBoardDialog } from "./share-board-dialog";

const {
  useActionMock,
  useMutationMock,
  useQueryMock,
  inviteByEmailMock,
  removeParticipantMock,
  leaveBoardMock,
} = vi.hoisted(() => ({
  useActionMock: vi.fn(),
  useMutationMock: vi.fn(),
  useQueryMock: vi.fn(),
  inviteByEmailMock: vi.fn(),
  removeParticipantMock: vi.fn(),
  leaveBoardMock: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useAction: useActionMock,
  useMutation: useMutationMock,
  useQuery: useQueryMock,
}));

vi.mock("@/convex/_generated/api", () => ({
  api: {
    invitations: {
      inviteByEmail: "invitations.inviteByEmail",
      listPendingForBoard: "invitations.listPendingForBoard",
    },
    boards: {
      removeParticipant: "boards.removeParticipant",
      leaveBoard: "boards.leaveBoard",
    },
  },
}));

vi.mock("@/components/ui/dialog", () => ({
  Dialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div>{children}</div> : null,
  DialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  DialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/ui/alert-dialog", () => ({
  AlertDialog: ({ open, children }: { open: boolean; children: ReactNode }) =>
    open ? <div>{children}</div> : null,
  AlertDialogContent: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogHeader: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogTitle: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogDescription: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogFooter: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AlertDialogCancel: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
  AlertDialogAction: ({
    children,
    onClick,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
  }) => (
    <button type="button" onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/button", () => ({
  Button: ({
    children,
    onClick,
    type,
    disabled,
  }: {
    children: ReactNode;
    onClick?: () => void;
    type?: "button" | "submit";
    disabled?: boolean;
  }) => (
    <button type={type ?? "button"} onClick={onClick} disabled={disabled}>
      {children}
    </button>
  ),
}));

vi.mock("@/components/ui/avatar", () => ({
  Avatar: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AvatarFallback: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  AvatarImage: () => null,
}));

describe("ShareBoardDialog", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useActionMock.mockReturnValue(inviteByEmailMock);
    useMutationMock.mockImplementation((mutation: string) => {
      if (mutation === "boards.removeParticipant") return removeParticipantMock;
      if (mutation === "boards.leaveBoard") return leaveBoardMock;
      return vi.fn();
    });
    useQueryMock.mockReturnValue([]);
    removeParticipantMock.mockResolvedValue(undefined);
    leaveBoardMock.mockResolvedValue(undefined);
  });

  it("allows owner to remove a participant", async () => {
    render(
      <ShareBoardDialog
        open
        onOpenChange={vi.fn()}
        boardId={"board-1" as never}
        isOwner
        ownerId="owner-1"
        currentUserId="owner-1"
        participants={[
          { _id: "owner-1", name: "Owner", image: null },
          { _id: "user-2", name: "Invitado", image: null },
        ]}
        onLeaveBoard={vi.fn()}
      />
    );

    fireEvent.click(screen.getAllByRole("button", { name: "Quitar" })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: "Quitar" })[1]);

    await waitFor(() => {
      expect(removeParticipantMock).toHaveBeenCalledWith({
        boardId: "board-1",
        userId: "user-2",
      });
    });
  });

  it("allows participant to leave board", async () => {
    const onOpenChange = vi.fn();
    const onLeaveBoard = vi.fn();

    render(
      <ShareBoardDialog
        open
        onOpenChange={onOpenChange}
        boardId={"board-1" as never}
        isOwner={false}
        ownerId="owner-1"
        currentUserId="user-2"
        participants={[
          { _id: "owner-1", name: "Owner", image: null },
          { _id: "user-2", name: "Invitado", image: null },
        ]}
        onLeaveBoard={onLeaveBoard}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Salirme del tablero" }));
    fireEvent.click(screen.getByRole("button", { name: "Salir del tablero" }));

    await waitFor(() => {
      expect(leaveBoardMock).toHaveBeenCalledWith({ boardId: "board-1" });
      expect(onOpenChange).toHaveBeenCalledWith(false);
      expect(onLeaveBoard).toHaveBeenCalledTimes(1);
    });
  });
});
