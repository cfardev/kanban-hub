import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button, buttonVariants } from "../../../src/components/ui/button";

describe("Button component", () => {
  it("should render with default props", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("should render different variants", () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "default");

    rerender(<Button variant="destructive">Destructive</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "destructive");

    rerender(<Button variant="outline">Outline</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "outline");

    rerender(<Button variant="ghost">Ghost</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "ghost");

    rerender(<Button variant="secondary">Secondary</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "secondary");

    rerender(<Button variant="link">Link</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-variant", "link");
  });

  it("should render different sizes", () => {
    const { rerender } = render(<Button size="default">Default</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "default");

    rerender(<Button size="sm">Small</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "sm");

    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "lg");

    rerender(<Button size="icon">Icon</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon");

    rerender(<Button size="xs">XS</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "xs");

    rerender(<Button size="icon-sm">Icon SM</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon-sm");

    rerender(<Button size="icon-xs">Icon XS</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon-xs");

    rerender(<Button size="icon-lg">Icon LG</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("data-size", "icon-lg");
  });

  it("should be disabled when disabled prop is passed", () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("should handle click events", async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    await userEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("should render with custom className", () => {
    render(<Button className="custom-class">Custom</Button>);
    expect(screen.getByRole("button")).toHaveClass("custom-class");
  });
});

describe("buttonVariants", () => {
  it("should return default variant classes", () => {
    const classes = buttonVariants({ variant: "default" });
    expect(classes).toContain("bg-primary");
  });

  it("should return destructive variant classes", () => {
    const classes = buttonVariants({ variant: "destructive" });
    expect(classes).toContain("text-destructive");
  });

  it("should return outline variant classes", () => {
    const classes = buttonVariants({ variant: "outline" });
    expect(classes).toContain("border-border");
  });

  it("should return ghost variant classes", () => {
    const classes = buttonVariants({ variant: "ghost" });
    expect(classes).toContain("hover:bg-muted");
  });

  it("should return secondary variant classes", () => {
    const classes = buttonVariants({ variant: "secondary" });
    expect(classes).toContain("bg-secondary");
  });

  it("should return link variant classes", () => {
    const classes = buttonVariants({ variant: "link" });
    expect(classes).toContain("text-primary");
    expect(classes).toContain("underline-offset-4");
  });

  it("should return default size classes", () => {
    const classes = buttonVariants({ size: "default" });
    expect(classes).toContain("h-8");
  });

  it("should return sm size classes", () => {
    const classes = buttonVariants({ size: "sm" });
    expect(classes).toContain("h-7");
  });

  it("should return lg size classes", () => {
    const classes = buttonVariants({ size: "lg" });
    expect(classes).toContain("h-9");
  });

  it("should return icon size classes", () => {
    const classes = buttonVariants({ size: "icon" });
    expect(classes).toContain("size-8");
  });
});
