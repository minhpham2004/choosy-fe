// Nathan Ravasini
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Register from "./register";
import { vi } from "vitest";
import axios from "axios";

// Mocks
vi.mock("axios", () => ({
  default: {
    post: vi.fn().mockResolvedValue({ data: { id: "user-1" } }),
  },
}));

vi.mock("../../utils/upload-image", () => ({
  uploadToCloudinary: vi.fn().mockResolvedValue("/blank-profile.png"),
}));

vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
}));

// JSDOM helpers
beforeAll(() => {
  // @ts-expect-error add missing JSDOM APIs
  global.URL.createObjectURL = vi.fn(() => "blob:mock");
  // @ts-expect-error add missing JSDOM APIs
  global.URL.revokeObjectURL = vi.fn();

  // prevent real navigation
  Object.defineProperty(window, "location", {
    value: { assign: vi.fn() },
    writable: true,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("Register", () => {
  it("renders core fields and Sign up button", () => {
    render(<Register />);
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/display name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/age/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /sign up/i })).toBeInTheDocument();
  });

  it("button is disabled without an avatar", async () => {
    const user = userEvent.setup();
    render(<Register />);

    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "passw0rd1");
    await user.type(screen.getByLabelText(/display name/i), "Tester");
    await user.type(screen.getByLabelText(/age/i), "21");

    const btn = screen.getByRole("button", { name: /sign up/i });
    expect(btn).toBeDisabled();
    expect((axios as any).post).not.toHaveBeenCalled();
  });

  it("enables the button once an avatar is uploaded and submits successfully", async () => {
    const user = userEvent.setup();
    const { uploadToCloudinary } = await import("../../utils/upload-image");

    render(<Register />);

    // Fill required fields
    await user.type(screen.getByLabelText(/email/i), "test@example.com");
    await user.type(screen.getByLabelText(/^password$/i), "passw0rd1");
    await user.type(screen.getByLabelText(/display name/i), "Tester");
    await user.type(screen.getByLabelText(/age/i), "21");

    // Upload avatar -> enables button
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const file = new File(["avatar-bytes"], "avatar.png", { type: "image/png" });
    await user.upload(fileInput, file);

    const btn = screen.getByRole("button", { name: /sign up/i });
    expect(btn).toBeEnabled();

    // Submit
    await user.click(btn);

    // Uploader called
    expect(uploadToCloudinary).toHaveBeenCalledTimes(1);

    // Backend called with transformed payload
    expect((axios as any).post).toHaveBeenCalledTimes(1);
    const [path, payload] = (axios as any).post.mock.calls[0];
    expect(path).toBe("/user");
    expect(payload.email).toBe("test@example.com");
    expect(payload.displayName).toBe("Tester");
    expect(payload.age).toBe(21);
    expect(payload.avatarUrl).toBe("/blank-profile.png");

    // Navigates to /login
    expect(window.location.assign).toHaveBeenCalledWith("/login");
  });
});
