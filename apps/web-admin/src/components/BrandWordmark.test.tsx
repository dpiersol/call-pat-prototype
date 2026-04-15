import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import BrandWordmark from "./BrandWordmark";

describe("BrandWordmark", () => {
  it("renders accessible city branding", () => {
    render(<BrandWordmark tone="on-blue" />);
    expect(screen.getByLabelText("One Albuquerque")).toBeInTheDocument();
    expect(screen.getByText("ONE")).toBeInTheDocument();
    expect(screen.getByText("ALBUQUERQUE")).toBeInTheDocument();
  });
});
