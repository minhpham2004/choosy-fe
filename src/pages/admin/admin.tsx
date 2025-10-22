import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
} from "@mui/material";
import { MoreVert } from "@mui/icons-material";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type User = {
  _id: string;
  displayName: string;
  status: "active" | "banned";
};

type Report = {
  _id: string;
  fromUser: string;
  againstUser: string;
  reason: string;
};

const ADMIN_PASSWORD = "admin123";

export default function AdminDashboard() {
  const [unlocked, setUnlocked] = useState(
    localStorage.getItem("adminUnlocked") === "true"
  );
  const [enteredPassword, setEnteredPassword] = useState("");

  const [query, setQuery] = useState("");
  const [result, setResult] = useState<User | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  const menuOpen = Boolean(anchorEl);

  useEffect(() => {
    if (unlocked) fetchReports();
  }, [unlocked]);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("/report/all", {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const data = Array.isArray(res.data) ? res.data : res.data?.reports || [];

      const formatted = data.map((r: any) => ({
        _id: r._id,
        fromUser: r.reporterName || "Unknown",
        againstUser: r.reportedName || "Unknown",
        reason: r.reason || "No reason provided",
      }));

      setReports(formatted);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load reports");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = () => {
    if (enteredPassword === ADMIN_PASSWORD) {
      toast.success("Admin access granted");
      setUnlocked(true);
      localStorage.setItem("adminUnlocked", "true");
    } else {
      toast.error("Incorrect password");
    }
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get(
        `/user/search?query=${encodeURIComponent(query)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );

      const user = Array.isArray(res.data)
        ? res.data[0]
        : res.data
        ? res.data
        : null;

      if (!user) {
        toast.error("No user found");
        setResult(null);
        return;
      }

      setResult({
        _id: user._id,
        displayName: user.displayName || "Unnamed",
        status: user.status || "active",
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Search failed");
      setResult(null);
    }
  };

  const updateStatus = async (status: User["status"]) => {
    if (!result) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.post(
        `/user/${status === "banned" ? "ban" : "unban"}/${result._id}`,
        {},
        {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        }
      );
      toast.success(`${result.displayName} is now ${status}`);
      setResult({ ...result, status });
    } catch {
      toast.error("Failed to update status");
    }
  };

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLButtonElement>,
    reportId: string
  ) => {
    setSelectedReportId(reportId);
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedReportId(null);
  };

  const handleResolve = async () => {
    if (!selectedReportId) return;
    try {
      const token = localStorage.getItem("authToken");
      await axios.delete(`/report/${selectedReportId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      toast.success("Report resolved");
      setReports((prev) => prev.filter((r) => r._id !== selectedReportId));
    } catch (err) {
      console.error(err);
      toast.error("Failed to resolve report");
    } finally {
      handleMenuClose();
    }
  };

  if (!unlocked) {
    return (
      <Box
        sx={{
          p: 3,
          display: "grid",
          placeItems: "center",
          height: "100vh",
          bgcolor: "background.default",
        }}
      >
        <Card sx={{ width: 380, maxWidth: "90vw" }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Enter Admin Password
            </Typography>
            <Stack spacing={2}>
              <TextField
                label="Admin Password"
                type="password"
                fullWidth
                value={enteredPassword}
                onChange={(e) => setEnteredPassword(e.target.value)}
              />
              <Button variant="contained" onClick={handlePasswordSubmit}>
                Unlock Dashboard
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 480, maxWidth: "95vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Admin Dashboard
          </Typography>

          <Stack spacing={2} mb={3}>
            <Stack direction="row" spacing={1}>
              <TextField
                fullWidth
                label="Search Users"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>
            </Stack>

            {result && (
              <Card sx={{ p: 2, bgcolor: "grey.100" }}>
                <Typography variant="subtitle1">
                  {result.displayName} (ID: {result._id})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color:
                      result.status === "active"
                        ? "success.main"
                        : "error.main",
                  }}
                >
                  Status: {result.status}
                </Typography>
                <Stack direction="row" spacing={1}>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => updateStatus("banned")}
                  >
                    Ban
                  </Button>
                  <Button
                    variant="outlined"
                    color="success"
                    onClick={() => updateStatus("active")}
                  >
                    Unban
                  </Button>
                </Stack>
              </Card>
            )}

            {!result && query && <Typography>No user found</Typography>}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Report Logs
          </Typography>
          {loading ? (
            <Typography>Loading reports...</Typography>
          ) : (
            <List dense>
              {reports.map((r) => (
                <ListItem
                  key={r._id}
                  sx={{
                    borderBottom: "1px solid #eee",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <ListItemText
                    primary={`From: ${r.fromUser} → Against: ${r.againstUser}`}
                    secondary={`Reason: ${r.reason}`}
                  />
                  <IconButton onClick={(e) => handleMenuOpen(e, r._id)}>
                    <MoreVert />
                  </IconButton>
                </ListItem>
              ))}
            </List>
          )}

          <Menu anchorEl={anchorEl} open={menuOpen} onClose={handleMenuClose}>
            <MenuItem onClick={handleResolve}>Resolve Report</MenuItem>
          </Menu>

          <Divider sx={{ my: 2 }} />
          <Button
            variant="text"
            color="error"
            fullWidth
            onClick={() => {
              localStorage.removeItem("adminUnlocked");
              setUnlocked(false);
              toast("Admin locked");
            }}
          >
            Lock Admin Panel
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
