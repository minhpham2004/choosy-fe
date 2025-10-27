// Anthony Alexis
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportButton from "./report";
import axios from "axios";
import toast from "react-hot-toast";
import { vi, describe, beforeEach, it, expect } from "vitest";

vi.mock("axios");
vi.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
  success: vi.fn(),
  error: vi.fn(),
}));

describe("ReportButton Component", () => {
  const candidateId = "user123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the Report button", () => {
    render(<ReportButton candidateId={candidateId} />);
    expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument();
  });

  it("opens dialog on Report button click", async () => {
    render(<ReportButton candidateId={candidateId} />);
    fireEvent.click(screen.getByRole("button", { name: /report/i }));

    expect(await screen.findByText(`Report ${candidateId}`)).toBeInTheDocument();
    expect(screen.getByLabelText(/reason for report/i)).toBeInTheDocument();
  });

  it("closes dialog on Cancel", async () => {
    render(<ReportButton candidateId={candidateId} />);
    fireEvent.click(screen.getByRole("button", { name: /report/i }));
    fireEvent.click(screen.getByRole("button", { name: /cancel/i }));

    await waitFor(() => {
      expect(screen.queryByText(`Report ${candidateId}`)).not.toBeInTheDocument();
    });
  });

  it("shows error toast if reason is empty", async () => {
    render(<ReportButton candidateId={candidateId} />);
    fireEvent.click(screen.getByRole("button", { name: /report/i }));
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Please enter a reason");
    });
  });

  it("shows error toast if submission fails", async () => {
    (axios.post as any).mockRejectedValueOnce(new Error("fail"));

    render(<ReportButton candidateId={candidateId} />);
    fireEvent.click(screen.getByRole("button", { name: /report/i }));
    fireEvent.change(screen.getByLabelText(/reason for report/i), {
      target: { value: "Abuse" },
    });
    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Failed to submit report");
      expect(screen.getByText(`Report ${candidateId}`)).toBeInTheDocument();
    });
  });
});
