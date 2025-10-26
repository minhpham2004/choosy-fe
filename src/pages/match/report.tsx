import {
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";

export default function ReportButton({ candidateId }: { candidateId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setReason("");
    setOpen(false);
  };

  const submitReport = async () => {
    if (!reason.trim()) {
      toast.error("Please enter a reason");
      return;
    }

    try {
      setLoading(true);

      const token = localStorage.getItem("authToken");
      await axios.post(
        "/report",
        { reportedId: candidateId, reason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success("Report submitted successfully");
      handleClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleOpen} variant="contained" color="warning">
        Report
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Report {candidateId}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Reason for report"
            type="text"
            fullWidth
            multiline
            rows={4}
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={submitReport} disabled={loading} color="warning">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
