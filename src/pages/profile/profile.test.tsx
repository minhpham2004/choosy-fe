// Minh Pham
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Profile from "./profile";
import axios from "axios";
import toast from "react-hot-toast";
import { vi, describe, beforeEach, it, expect } from "vitest";

vi.mock("axios");
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
    dismiss: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
  loading: vi.fn(),
  dismiss: vi.fn(),
}));

describe("Profile Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders form fields", async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        displayName: "John",
        age: 30,
        bio: "Hello world",
        avatarUrl: "http://test.com/avatar.png",
        areaKey: "sydney",
        discoverable: true,
        interests: ["music"],
        gender: "Man",
        prefs: {
          minAge: 20,
          maxAge: 40,
          allowedAreas: ["sydney"],
          maxDistanceTier: "mid",
        },
      },
    });

    render(<Profile />);

    expect(await screen.findByDisplayValue("John")).toBeInTheDocument();
    expect(screen.getByDisplayValue("30")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Hello world")).toBeInTheDocument();
    expect(await screen.findByDisplayValue("Man")).toBeInTheDocument();
  });

  it("lets user edit and save profile", async () => {
    (axios.get as any).mockResolvedValueOnce({ data: {} });
    (axios.put as any).mockResolvedValueOnce({});

    render(<Profile />);

    const nameInput = await screen.findByLabelText(/Display Name/i);
    fireEvent.change(nameInput, { target: { value: "Alice" } });

    const ageInput = screen.getByLabelText(/^Age$/i);
    fireEvent.change(ageInput, { target: { value: "25" } });

    const saveButton = screen.getByRole("button", { name: /Save Profile/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/profiles",
        expect.objectContaining({
          displayName: "Alice",
          age: 25,
        })
      );
    });

    expect(toast.success).toHaveBeenCalledWith("Profile saved!");
  });

  it("shows error toast when save fails", async () => {
    (axios.get as any).mockResolvedValueOnce({ data: {} });

    const error = new Error("Request failed") as any;
    error.response = { data: { message: "Bad Request" } };
    (axios.put as any).mockRejectedValueOnce(error);

    render(<Profile />);

    fireEvent.click(
      await screen.findByRole("button", { name: /Save Profile/i })
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Bad Request");
    });
  });

  it("prefills gender from API and sends it on save", async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        displayName: "John",
        gender: "Non-binary",
      },
    });
    (axios.put as any).mockResolvedValueOnce({});

    render(<Profile />);

    expect(await screen.findByDisplayValue("Non-binary")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /Save Profile/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/profiles",
        expect.objectContaining({ gender: "Non-binary" })
      );
    });
  });

  it("sends null for gender when left blank", async () => {
    (axios.get as any).mockResolvedValueOnce({ data: {} });
    (axios.put as any).mockResolvedValueOnce({});

    render(<Profile />);

    fireEvent.click(await screen.findByRole("button", { name: /Save Profile/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/profiles",
        expect.objectContaining({ gender: null })
      );
    });
  });

  it("allows for selecting a different gender and sends it", async () => {
    (axios.get as any).mockResolvedValueOnce({
      data: {
        displayName: "John",
        gender: "Man",
      },
    });
    (axios.put as any).mockResolvedValueOnce({});

    render(<Profile />);

    const genderSelect = await screen.findByLabelText(/Gender/i);
    fireEvent.mouseDown(genderSelect);

    const option = await screen.findByRole("option", { name: "Woman" });
    fireEvent.click(option);

    fireEvent.click(screen.getByRole("button", { name: /Save Profile/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        "/profiles",
        expect.objectContaining({ gender: "Woman" })
      );
    });
  });
});