import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "./register";
import axios from "axios";
import { vi } from "vitest";

vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { ok: true } }),
  },
}));

describe("Register", () => {
  it("submits when all required fields are filled", async () => {
    render(<Register />);

    // Fill required text fields
    await userEvent.type(screen.getByLabelText(/email/i), "test@example.com");
    await userEvent.type(screen.getByLabelText(/^password/i), "password1");
    await userEvent.type(screen.getByLabelText(/display name/i), "Robot");
    await userEvent.type(screen.getByLabelText(/age/i), "20");

    // Area
    const areaSelect = screen.getByLabelText(/area/i);
    await userEvent.click(areaSelect); // open dropdown
    const listbox = await screen.findByRole("listbox");
    const firstOption = within(listbox).getAllByRole("option")[0];
    await userEvent.click(firstOption);

    // Interests
    const interestsInput = screen.queryByLabelText(/interests/i);
    if (interestsInput) {
      await userEvent.click(interestsInput);
      const listbox = await screen.findByRole("listbox");
      const firstOption = within(listbox).getAllByRole("option")[0];
      await userEvent.click(firstOption);
    }

    // Submit
    await userEvent.click(screen.getByRole("button", { name: /sign up/i }));

    // Assert API call
    expect((axios as any).post).toHaveBeenCalled();
  });
});
