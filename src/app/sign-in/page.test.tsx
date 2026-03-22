import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignInPage from "./page";

const { useSearchParamsMock, signInEmailMock, signInSocialMock } = vi.hoisted(() => ({
  useSearchParamsMock: vi.fn(),
  signInEmailMock: vi.fn(),
  signInSocialMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useSearchParams: useSearchParamsMock,
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: signInEmailMock,
      social: signInSocialMock,
    },
  },
}));

vi.mock("@/components/theme-toggle", () => ({
  ThemeToggle: () => <div>ThemeToggle</div>,
}));

vi.mock("@/components/logo", () => ({
  Logo: () => <div>Logo</div>,
}));

describe("SignInPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useSearchParamsMock.mockReturnValue({
      get: vi.fn().mockReturnValue(null),
    });
    signInEmailMock.mockResolvedValue({ error: null });
  });

  it("submits credentials with default callback", async () => {
    signInEmailMock.mockResolvedValueOnce({ error: { message: "Credenciales incorrectas" } });

    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "user@mail.com" } });
    fireEvent.change(screen.getByLabelText("Contrasena"), { target: { value: "12345678" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => {
      expect(signInEmailMock).toHaveBeenCalledWith({
        email: "user@mail.com",
        password: "12345678",
        callbackURL: "/dashboard",
      });
    });
  });

  it("shows auth error on failed login", async () => {
    signInEmailMock.mockResolvedValueOnce({ error: { message: "Invalid email or password" } });
    render(<SignInPage />);

    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "bad@mail.com" } });
    fireEvent.change(screen.getByLabelText("Contrasena"), { target: { value: "bad-pass" } });
    fireEvent.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("Correo o contrasena incorrectos")).toBeInTheDocument();
  });

  it("starts social sign-in with callback query param", async () => {
    useSearchParamsMock.mockReturnValue({
      get: vi
        .fn()
        .mockImplementation((key: string) =>
          key === "callbackUrl" ? "/dashboard/boards/abc" : null
        ),
    });

    render(<SignInPage />);

    fireEvent.click(screen.getByRole("button", { name: "Google" }));

    expect(signInSocialMock).toHaveBeenCalledWith({
      provider: "google",
      callbackURL: "/dashboard/boards/abc",
    });
  });
});
