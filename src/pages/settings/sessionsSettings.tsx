// Nathan Ravasini
import {
  Card,
  CardContent,
  Stack,
  Typography,
  Button,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import { useState } from "react";
import toast from "react-hot-toast";

/**
 * SessionsSettings is a placeholder UI for managing active sessions/devices.
 * - No backend calls yet (purely a stub).
 * - Emits toasts to indicate work-in-progress.
 */
export default function SessionsSettings() {
  return (
    <Stack flex={1} gap={3}>
      <IntroCard />
      <ActiveSessionsSection />
      <DangerZoneSection />
    </Stack>
  );
}

// Intro / Help
function IntroCard() {
  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Sessions</Typography>
        <Alert severity="info">
          This page is still in progress. You will soon be able to review devices,
          sign out specific sessions, and require re-login everywhere.
        </Alert>
      </CardContent>
    </Card>
  );
}

// Active Sessions
function ActiveSessionsSection() {
  const [loading, setLoading] = useState(false);

  // Hardcoded sample data purely for UI preview
  const sessions = [
    {
      id: "current",
      label: "This device",
      detail: "Chrome • macOS",
      meta: "Last active just now",
      current: true,
    },
    {
      id: "xyz",
      label: "Windows PC",
      detail: "Edge • Windows 11",
      meta: "Last active 2 hours ago • Sydney",
      current: false,
    },
        {
      id: "abc",
      label: "Apple iPhone",
      detail: "Safari • iOS",
      meta: "Last active 1 day ago • Sydney",
      current: false,
    },
  ];

  function refreshStub() {
    setLoading(true);
    toast("Refreshing sessions… (stub)");
    setTimeout(() => setLoading(false), 600);
  }

  function signOutSingleStub(id: string) {
    toast(`Sign out of session '${id}' is work in progress.`);
  }

  return (
    <Card>
      <CardContent>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "stretch", sm: "center" }}
          gap={2}
          sx={{ mb: 2 }}
        >
          <Typography variant="h6">Active sessions</Typography>
          <Button
            variant="outlined"
            onClick={refreshStub}
            disabled={loading}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </Button>
        </Stack>

        <List sx={{ py: 0 }}>
          {sessions.map((s, i) => (
            <Box key={s.id}>
              <ListItem
                secondaryAction={
                  s.current ? (
                    <Chip size="small" color="success" label="Current" />
                  ) : (
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => signOutSingleStub(s.id)}
                    >
                      Sign out
                    </Button>
                  )
                }
              >
                <ListItemText
                  primary={
                    <Stack direction="row" alignItems="center" gap={1}>
                      <Typography>{s.label}</Typography>
                      {s.current && <Chip size="small" label="This device" />}
                    </Stack>
                  }
                  secondary={`${s.detail} — ${s.meta}`}
                />
              </ListItem>
              {i < sessions.length - 1 && <Divider component="li" />}
            </Box>
          ))}
        </List>
      </CardContent>
    </Card>
  );
}

// !!! Danger Zone (global sign out) !!!
function DangerZoneSection() {
  function signOutAllStub() {
    toast("Signing out of all sessions is work in progress.");
  }

  return (
    <Card variant="outlined" sx={{ borderColor: "warning.main" }}>
      <CardContent>
        <Typography variant="h6" color="warning.main" gutterBottom>
          Sign out everywhere
        </Typography>
        <Typography color="text.secondary" gutterBottom>
          Force all devices to sign in again. Use this if you suspect any
          unauthorized access. (Stub only)
        </Typography>
        <Button color="warning" variant="contained" onClick={signOutAllStub}>
          Sign out of all sessions
        </Button>
      </CardContent>
    </Card>
  );
}