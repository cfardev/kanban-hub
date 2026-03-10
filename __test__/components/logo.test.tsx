import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { Logo } from "../../src/components/logo";

describe("Logo component", () => {
  it("should render with default props", () => {
    render(<Logo />);
    expect(screen.getByText("KanbanHub")).toBeInTheDocument();
  });

  it("should render with custom className", () => {
    const { container } = render(<Logo className="custom-class" />);
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("should render as link when href is provided", () => {
    render(<Logo href="/dashboard" />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/dashboard");
  });

  it("should not render as link when href is not provided", () => {
    const { container } = render(<Logo />);
    expect(container.querySelector("a")).not.toBeInTheDocument();
  });

  it("should render icon", () => {
    render(<Logo />);
    const icon = document.querySelector("svg");
    expect(icon).toBeInTheDocument();
  });
});
