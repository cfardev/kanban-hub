import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import SignUpPage from "./page";

const { signUpEmailMock, signInSocialMock } = vi.hoisted(() => ({
  signUpEmailMock: vi.fn(),
  signInSocialMock: vi.fn(),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signUp: {
      email: signUpEmailMock,
    },
    signIn: {
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

describe("SignUpPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    signUpEmailMock.mockResolvedValue({});
  });

  it("validates mismatched passwords before submit", async () => {
    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "ana@mail.com" } });
    fireEvent.change(screen.getByLabelText("Contrasena"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Confirmar contrasena"), {
      target: { value: "abcdefgh" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    expect(await screen.findByText("Passwords do not match")).toBeInTheDocument();
    expect(signUpEmailMock).not.toHaveBeenCalled();
  });

  it("submits valid data", async () => {
    signUpEmailMock.mockRejectedValueOnce(new Error("signup failed"));

    render(<SignUpPage />);

    fireEvent.change(screen.getByLabelText("Nombre"), { target: { value: "Ana" } });
    fireEvent.change(screen.getByLabelText("Correo"), { target: { value: "ana@mail.com" } });
    fireEvent.change(screen.getByLabelText("Contrasena"), { target: { value: "12345678" } });
    fireEvent.change(screen.getByLabelText("Confirmar contrasena"), {
      target: { value: "12345678" },
    });
    fireEvent.click(screen.getByRole("button", { name: "Crear cuenta" }));

    await waitFor(() => {
      expect(signUpEmailMock).toHaveBeenCalledWith({
        email: "ana@mail.com",
        password: "12345678",
        name: "Ana",
      });
    });
  });
});
