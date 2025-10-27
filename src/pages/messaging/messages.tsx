// Harry Solterbeck
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
  Button,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

/* ============================================================
   MOCK TOGGLE (no visible indicators)
   ============================================================ */
const USE_MOCK = true;

/* ============================================================
   Types
   ============================================================ */
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

/* ============================================================
   Helpers
   ============================================================ */
function normalizeMatches(payload: unknown): Match[] {
  if (Array.isArray(payload)) return payload as Match[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, any>;
    if (Array.isArray(o.matches)) return o.matches as Match[];
    if (Array.isArray(o.value)) return o.value as Match[];
    if (Array.isArray(o.data)) return o.data as Match[];
    if (Array.isArray(o.result)) return o.result as Match[];
  }
  return [];
}

function normalizeMessages(payload: unknown): Message[] {
  if (Array.isArray(payload)) return payload as Message[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, any>;
    if (Array.isArray(o.messages)) return o.messages as Message[];
    if (Array.isArray(o.lastMessages)) return o.lastMessages as Message[];
    if (Array.isArray(o.data)) return o.data as Message[];
    if (Array.isArray(o.result)) return o.result as Message[];
  }
  return [];
}

function decodeJwt(token: string): any | null {
  try {
    const payloadB64 = token.split(".")[1];
    const b64 = payloadB64.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

const getToken = () => localStorage.getItem("accessToken") || "";

const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// resolve base each call (avoids memo timing)
const apiUrl = (path: string) => {
  const base =
    (axios.defaults as any)?.baseURL ||
    (import.meta as any)?.env?.VITE_BACKEND_URL ||
    "";
  const clean = base ? base.replace(/\/$/, "") : "";
  return clean ? `${clean}${path}` : path;
};

// quick objectId-like generator for mock messages
function newObjectId() {
  const ts = Math.floor(Date.now() / 1000).toString(16);
  const rnd = Array.from({ length: 16 }, () =>
    Math.floor(Math.random() * 16).toString(16)
  ).join("");
  return (ts + rnd).slice(0, 24);
}

/* ============================================================
   MOCK DATA (Harry ↔ Elise) — perspective auto from JWT email
   ============================================================ */

const HARRY_ID = "68dd54137b0430ce890ed2b5";
const ELISE_EMAIL = "elise9@example.com";
const ELISE_ID = "68dd54137b0430ce890ed2b6";
const MATCH_ID = "66aa11bb22cc33dd44ee55ff";

// in-memory store so “send” feels real
const MockDB = {
  matches: [
    {
      _id: MATCH_ID,
      userA: HARRY_ID,
      userB: ELISE_ID,
      lastMessageAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(), // 2 mins ago
    },
  ] as Match[],
  messages: [
    {
      _id: newObjectId(),
      matchId: MATCH_ID,
      senderId: HARRY_ID,
      body: "Hey Elise",
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    {
      _id: newObjectId(),
      matchId: MATCH_ID,
      senderId: ELISE_ID,
      body: "Hi Harry! All good here.",
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
    },
  ] as Message[],
};

const MockApi = {
  async getMatches(): Promise<Match[]> {
    await new Promise((r) => setTimeout(r, 180));
    return [...MockDB.matches].sort(
      (a, b) =>
        new Date(b.lastMessageAt || 0).getTime() -
        new Date(a.lastMessageAt || 0).getTime()
    );
  },
  async getMessages(matchId: string, limit = 50): Promise<Message[]> {
    await new Promise((r) => setTimeout(r, 140));
    return MockDB.messages
      .filter((m) => m.matchId === matchId)
      .sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
      .slice(-limit);
  },
  async sendMessage(matchId: string, senderId: string, body: string) {
    await new Promise((r) => setTimeout(r, 120));
    const now = new Date().toISOString();
    const msg: Message = {
      _id: newObjectId(),
      matchId,
      senderId,
      body,
      createdAt: now,
      updatedAt: now,
    };
    MockDB.messages.push(msg);
    const match = MockDB.matches.find((m) => m._id === matchId);
    if (match) match.lastMessageAt = now;
    return { ok: true, message: msg };
  },
};

/* ============================================================
   Component
   ============================================================ */
export default function Messages() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [msgInput, setMsgInput] = useState("");
  const pollRef = useRef<number | null>(null);

  // Figure out who's logged in:
  // - MOCK: decide by JWT email (Elise vs Harry). If no token/email, default Harry.
  // - REAL: derive from localStorage.user or JWT claims.
  const token = getToken();
  const meId = useMemo(() => {
    if (USE_MOCK) {
      const email = (token ? decodeJwt(token)?.email : null)?.toLowerCase();
      if (email === ELISE_EMAIL) return ELISE_ID;
      return HARRY_ID; // default to Harry
    }
    try {
      const rawUser = localStorage.getItem("user");
      if (rawUser) {
        const parsed = JSON.parse(rawUser);
        const id = parsed?._id ?? parsed?.userId ?? null;
        if (id) return String(id);
      }
      if (token) {
        const jwt = decodeJwt(token);
        const id = jwt?._id ?? jwt?.userId ?? jwt?.sub ?? jwt?.id ?? null;
        if (id) return String(id);
      }
      return null;
    } catch {
      return null;
    }
  }, [token]);

  // In real mode, block if not logged in. In mock, always allow.
  if (!USE_MOCK && !token) {
    return (
      <Box sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Messages
        </Typography>
        <Typography sx={{ mb: 2 }}>
          You need to be signed in to view your matches and messages.
        </Typography>
        <Button
          variant="contained"
          onClick={() => (window.location.href = "/login")}
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  // Load matches
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingMatches(true);
        let list: Match[] = [];
        if (USE_MOCK) {
          list = await MockApi.getMatches();
        } else {
          const { data } = await axios.get(apiUrl("/match/matches"), {
            headers: authHeader(),
          });
          list = normalizeMatches(data);
        }
        if (!mounted) return;
        setMatches(list);
        if (!selectedMatchId && list.length > 0) {
          setSelectedMatchId(list[0]._id);
        }
      } catch (err: any) {
        console.error("Failed to load matches:", err);
        const msg =
          err?.response?.data?.message ??
          err?.response?.data ??
          "Failed to load matches";
        toast.error(msg);
      } finally {
        if (mounted) setLoadingMatches(false);
      }
    })();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load & poll messages
  useEffect(() => {
    async function load() {
      if (!selectedMatchId) return;
      try {
        setLoadingMsgs(true);
        let list: Message[] = [];
        if (USE_MOCK) {
          list = await MockApi.getMessages(selectedMatchId, 50);
        } else {
          const { data } = await axios.get(apiUrl(`/chat/${selectedMatchId}`), {
            params: { limit: 50 },
            headers: authHeader(),
          });
          list = normalizeMessages(data);
        }
        setMsgs(list);
      } catch (err: any) {
        console.error("Failed to load messages:", err);
        const msg =
          err?.response?.data?.message ??
          err?.response?.data ??
          "Failed to load messages";
        toast.error(msg);
      } finally {
        setLoadingMsgs(false);
      }
    }

    load();

    if (pollRef.current) window.clearInterval(pollRef.current);
    if (selectedMatchId) {
      pollRef.current = window.setInterval(load, 3_000);
    }
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
    };
  }, [selectedMatchId]);

  // Send (mock just appends; real would POST)
  async function sendMessage() {
    if (!selectedMatchId || !meId) return;
    const body = msgInput.trim();
    if (!body) return;

    try {
      if (USE_MOCK) {
        const res = await MockApi.sendMessage(selectedMatchId, meId, body);
        if (res.ok && res.message) {
          setMsgs((m) => [...m, res.message!]);
          setMsgInput("");
          return;
        }
      } else {
        const { data } = await axios.post<{ ok: boolean; message?: Message }>(
          apiUrl(`/chat/${selectedMatchId}`),
          { body },
          { headers: authHeader() }
        );
        if (data?.ok && data?.message) {
          setMsgs((m) => [...m, data.message!]);
          setMsgInput("");
          return;
        }
        // fallback: refetch
        const { data: reload } = await axios.get(apiUrl(`/chat/${selectedMatchId}`), {
          params: { limit: 50 },
          headers: authHeader(),
        });
        setMsgs(normalizeMessages(reload));
        setMsgInput("");
      }
    } catch (err: any) {
      console.error("Send failed:", err);
      toast.error(err?.response?.data?.message ?? err?.response?.data ?? "Failed to send");
    }
  }

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
                  No matches found for your account yet.
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
            <CardContent
              sx={{ flex: 1, display: "flex", flexDirection: "column" }}
            >
              <Typography variant="h6" sx={{ mb: 5 }}>
                {selectedMatchId ? "Match Thread" : "Pick a match"}
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
                    No messages in this thread yet.
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
