//read me
//localStorage.getItem("accessToken")
//JSON.parse(atob(localStorage.getItem("accessToken").split(".")[1]))

import {
  Box,
  Card,
  CardContent,
  Typography,
  Stack,
  Container,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  TextField,
  IconButton,
  CircularProgress,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

type Match = {
  _id: string;
  userA: string;
  userB: string;
  lastMessageAt?: string;
};

type Message = {
  _id: string;
  matchId: string;
  senderId: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

function normalizeMatches(payload: unknown): Match[] {
  // Accept: Match[] OR { value: Match[] } OR { matches: Match[] }
  if (Array.isArray(payload)) return payload as Match[];
  if (payload && typeof payload === "object") {
    const anyObj = payload as Record<string, any>;
    if (Array.isArray(anyObj.value)) return anyObj.value as Match[];
    if (Array.isArray(anyObj.matches)) return anyObj.matches as Match[];
  }
  return [];
}

function normalizeMessages(payload: unknown): Message[] {
  // Accept: Message[] OR { ok, messages } OR { ok, lastMessages }
  if (Array.isArray(payload)) return payload as Message[];
  if (payload && typeof payload === "object") {
    const anyObj = payload as Record<string, any>;
    if (Array.isArray(anyObj.messages)) return anyObj.messages as Message[];
    if (Array.isArray(anyObj.lastMessages)) return anyObj.lastMessages as Message[];
  }
  return [];
}

export default function Messages() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const pollRef = useRef<number | null>(null);

  // Pull the logged-in user id from localStorage (be flexible on key shape)
  const meId = useMemo(() => {
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        return parsed?._id ?? parsed?.userId ?? null;
      }
      const rawLogin = localStorage.getItem("login");
      if (rawLogin) {
        const parsed = JSON.parse(rawLogin);
        return parsed?.user?._id ?? parsed?.userId ?? null;
      }
      return null;
    } catch {
      return null;
    }
  }, []);

  // Load matches on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingMatches(true);

        // IMPORTANT: relies on axios.defaults.baseURL set by your interceptor setup
        const { data } = await axios.get("/match/matches");
        const list = normalizeMatches(data);

        if (!mounted) return;
        setMatches(list);

        // auto-select first match if none selected
        if (!selectedMatchId && list.length > 0) {
          setSelectedMatchId(list[0]._id);
        }
      } catch (err: any) {
        console.error("Failed to load matches:", err);
        toast.error(err?.response?.data?.message ?? "Failed to load matches");
      } finally {
        if (mounted) setLoadingMatches(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load & poll messages for selected match
  useEffect(() => {
    async function load() {
      if (!selectedMatchId) return;
      try {
        setLoadingMsgs(true);
        const { data } = await axios.get(`/chat/${selectedMatchId}`, {
          params: { limit: 50 },
        });
        const list = normalizeMessages(data);
        setMsgs(list);
      } catch (err: any) {
        console.error("Failed to load messages:", err);
        toast.error(err?.response?.data?.message ?? "Failed to load messages");
      } finally {
        setLoadingMsgs(false);
      }
    }

    // initial load
    load();

    // polling
    if (pollRef.current) window.clearInterval(pollRef.current);
    if (selectedMatchId) {
      pollRef.current = window.setInterval(load, 3_000);
    }
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [selectedMatchId]);

  // Send message
  async function sendMessage() {
    if (!selectedMatchId) return;
    const body = msgInput.trim();
    if (!body) return;

    try {
      const { data } = await axios.post<{ ok: boolean; message?: Message }>(
        `/chat/${selectedMatchId}`,
        { body }
      );
      if (data?.ok && data?.message) {
        setMsgs((m) => [...m, data.message!]);
        setMsgInput("");
      } else {
        // if the API echoes a different shape, refetch thread
        const { data: reload } = await axios.get(`/chat/${selectedMatchId}`, {
          params: { limit: 50 },
        });
        setMsgs(normalizeMessages(reload));
        setMsgInput("");
      }
    } catch (err: any) {
      console.error("Send failed:", err);
      toast.error(err?.response?.data?.message ?? "Failed to send");
    }
  }

  // Tiny helpers for UI
  const otherUserIdOf = (m: Match) => {
    if (!meId) return null;
    return String(m.userA) === String(meId) ? String(m.userB) : String(m.userA);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="xl" sx={{ mb: 4, mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>

        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          {/* LEFT: Matches */}
          <Card sx={{ flex: 1, minHeight: 480 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5 }}>
                Matches
              </Typography>

              {loadingMatches ? (
                <CircularProgress size={22} />
              ) : matches.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  This is where you'll find your matches.
                </Typography>
              ) : (
                <List dense>
                  {matches.map((m) => {
                    const otherId = otherUserIdOf(m);
                    const selected = selectedMatchId === m._id;
                    return (
                      <ListItem key={m._id} disablePadding>
                        <ListItemButton
                          selected={!!selected}
                          onClick={() => setSelectedMatchId(m._id)}
                        >
                          <ListItemText
                            primary={
                              otherId
                                ? `Match ${otherId.slice(0, 6)}…`
                                : `Match ${m._id.slice(0, 6)}…`
                            }
                            secondary={
                              m.lastMessageAt
                                ? new Date(m.lastMessageAt).toLocaleString()
                                : "No messages yet"
                            }
                          />
                        </ListItemButton>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </CardContent>
          </Card>

          {/* RIGHT: Thread */}
          <Card
            sx={{
              flex: 1,
              minHeight: 480,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <CardContent sx={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <Typography variant="h6" sx={{ mb: 5 }}>
                {selectedMatchId ? "Match Name" : "Pick a match"}
              </Typography>

              {/* Messages */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {loadingMsgs && <CircularProgress size={22} />}
                {!loadingMsgs &&
                  msgs.map((m) => {
                    const mine = meId && String(m.senderId) === String(meId);
                    return (
                      <Box
                        key={m._id}
                        sx={{
                          alignSelf: mine ? "flex-end" : "flex-start",
                          bgcolor: mine ? "primary.main" : "grey.200",
                          color: mine ? "primary.contrastText" : "text.primary",
                          px: 1.5,
                          py: 1,
                          borderRadius: 2,
                          maxWidth: "75%",
                        }}
                        title={new Date(m.createdAt).toLocaleString()}
                      >
                        <Typography variant="body2">{m.body}</Typography>
                      </Box>
                    );
                  })}
                {!loadingMsgs && msgs.length === 0 && selectedMatchId && (
                  <Typography variant="body2" color="text.secondary">
                    This is where your messaging will be…
                  </Typography>
                )}
              </Box>

              {/* Composer */}
              {selectedMatchId && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <TextField
                      fullWidth
                      size="small"
                      placeholder="Type a message…"
                      value={msgInput}
                      onChange={(e) => setMsgInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                    />
                    <IconButton
                      color="primary"
                      aria-label="send"
                      onClick={sendMessage}
                      disabled={!msgInput.trim()}
                    >
                      <SendIcon />
                    </IconButton>
                  </Box>
                </>
              )}
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
