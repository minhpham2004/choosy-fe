// Nathan Ravasini
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./login";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { token: "ok" } }),
  },
}));

describe("Login", () => {
  it("renders email, password fields and Sign in button", () => {
    render(<Login />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
  });

  it("submits when valid values are entered", async () => {
    render(<Login />);
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/password/i), "password123");
    await userEvent.click(screen.getByRole("button", { name: /sign in/i }));

    expect((axios as any).post).toHaveBeenCalledTimes(1);
  });
});