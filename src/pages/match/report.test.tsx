import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ReportButton from "./report";
import { vi } from "vitest";
import axios from "axios";
import toast from "react-hot-toast";

vi.mock("axios");
vi.mock("react-hot-toast", () => ({
    __esModule: true,
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

describe("ReportButton", () => {
    const candidateId = "user123";

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("renders the Report button", () => {
        render(<ReportButton candidateId={candidateId} />);
        expect(screen.getByRole("button", { name: /report/i })).toBeInTheDocument();
    });

    it("opens dialog on Report button click", () => {
        render(<ReportButton candidateId={candidateId} />);
        fireEvent.click(screen.getByRole("button", { name: /report/i }));
        expect(screen.getByText(`Report ${candidateId}`)).toBeInTheDocument();
        expect(screen.getByLabelText(/reason for report/i)).toBeInTheDocument();
    });

    it("closes dialog on Cancel", () => {
        render(<ReportButton candidateId={candidateId} />);
        fireEvent.click(screen.getByRole("button", { name: /report/i }));
        fireEvent.click(screen.getByRole("button", { name: /cancel/i }));
        expect(screen.queryByText(`Report ${candidateId}`)).not.toBeInTheDocument();
    });

    it("shows error toast if reason is empty", async () => {
        render(<ReportButton candidateId={candidateId} />);
        fireEvent.click(screen.getByRole("button", { name: /report/i }));
        fireEvent.click(screen.getByRole("button", { name: /submit/i }));
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith("Please enter a reason");
        });
    });

    it("submits report and shows success toast", async () => {
        (axios.post as any).mockResolvedValue({});
        render(<ReportButton candidateId={candidateId} />);
        fireEvent.click(screen.getByRole("button", { name: /report/i }));
        fireEvent.change(screen.getByLabelText(/reason for report/i), {
            target: { value: "Spam" },
        });
        fireEvent.click(screen.getByRole("button", { name: /submit/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith("/match/report", {
                toUserId: candidateId,
                reason: "Spam",
            });
            expect(toast.success).toHaveBeenCalledWith("Report submitted successfully");
            expect(screen.queryByText(`Report ${candidateId}`)).not.toBeInTheDocument();
        });
    });

    it("shows error toast if failed", async () => {
        (axios.post as any).mockRejectedValue(new Error("fail"));
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