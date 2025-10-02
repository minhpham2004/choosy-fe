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
} from "@mui/material";
import { useState } from "react";

type User = {
  id: string;
  name: string;
  status: "active" | "banned" | "suspended";
};

const demoUsers: User[] = [
  { id: "1", name: "Alice Johnson", status: "active" },
  { id: "2", name: "Bob Smith", status: "suspended" },
  { id: "3", name: "Charlie Brown", status: "banned" },
];

type Report = {
  id: string;
  fromUser: string;
  againstUser: string;
  reason: string;
};

const demoReports: Report[] = [
  {
    id: "r1",
    fromUser: "User123",
    againstUser: "Alice Johnson",
    reason: "Spam messages",
  },
  {
    id: "r2",
    fromUser: "User456",
    againstUser: "Bob Smith",
    reason: "Harassment",
  },
];

export default function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<User | null>(null);

  const handleSearch = () => {
    const found = demoUsers.find(
      (u) =>
        u.name.toLowerCase().includes(query.toLowerCase()) ||
        u.id === query.trim()
    );
    setResult(found || null);
  };

  const updateStatus = (status: User["status"]) => {
    if (!result) return;
    setResult({ ...result, status });
  };

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
                label="Search Users"
                fullWidth
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <Button variant="contained" onClick={handleSearch}>
                Search
              </Button>
            </Stack>

            {result ? (
              <Card sx={{ p: 2, bgcolor: "grey.100" }}>
                <Typography variant="subtitle1">
                  {result.name} (ID: {result.id})
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    color:
                      result.status === "active"
                        ? "success.main"
                        : result.status === "banned"
                        ? "error.main"
                        : "warning.main",
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
            ) : (
              query && <Typography>No user found</Typography>
            )}
          </Stack>

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Report Logs
          </Typography>
          <List dense>
            {demoReports.map((r) => (
              <ListItem
                key={r.id}
                sx={{
                  borderBottom: "1px solid #eee",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-start",
                }}
              >
                <ListItemText
                  primary={`From: ${r.fromUser} → Against: ${r.againstUser}`}
                  secondary={`Reason: ${r.reason}`}
                />
              </ListItem>
            ))}
          </List>

          <Divider sx={{ my: 2 }} />

          <Button variant="text" color="error" fullWidth>
            Logout
          </Button>
        </CardContent>
      </Card>
    </Box>
  );
}
