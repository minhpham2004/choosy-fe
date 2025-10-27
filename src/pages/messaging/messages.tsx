// src/pages/messaging/messages.tsx
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
   Types
   ============================================================ */
type Match = {
  _id: string;
  userA: string | { _id?: string; id?: string };
  userB: string | { _id?: string; id?: string };
  lastMessageAt?: string;
};

type Message = {
  _id: string;
  matchId: string | { _id?: string; id?: string };
  senderId: string | { _id?: string; id?: string };
  body: string;
  createdAt: string;
  updatedAt: string;
};

/* ============================================================
   Helpers (normalization, auth, validation)
   ============================================================ */

// Normalize possible backend wrappers without exposing internals in UI
function normalizeMatches(payload: unknown): Match[] {
  if (Array.isArray(payload)) return payload as Match[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, any>;
    return (
      o.matches ||
      o.value ||
      o.data ||
      o.result ||
      []
    ) as Match[];
  }
  return [];
}

function normalizeMessages(payload: unknown): Message[] {
  if (Array.isArray(payload)) return payload as Message[];
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, any>;
    return (
      o.messages ||
      o.lastMessages ||
      o.data ||
      o.result ||
      []
    ) as Message[];
  }
  return [];
}

// Safely extract an id from a string or populated object
const idOf = (v: any): string | null => {
  if (!v) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object") return v._id || v.id || null;
  return null;
};

// Basic 24-hex ObjectId validation to avoid accidental malformed calls
const isValidObjectId = (s: string | null | undefined) =>
  !!s && /^[a-f0-9]{24}$/i.test(s);

// Decode JWT without trusting it beyond basic claims discovery
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

// Fallback header helper if interceptors were not yet initialized
const getToken = () => localStorage.getItem("accessToken") || "";
const authHeader = () => {
  const t = getToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
};

// Resolve base URL each call to avoid timing issues and keep requests off the Vite host
const apiUrl = (path: string) => {
  const base =
    (axios.defaults as any)?.baseURL ||
    (import.meta as any)?.env?.VITE_BACKEND_URL ||
    "";
  const clean = base ? base.replace(/\/$/, "") : "";
  return clean ? `${clean}${path}` : path;
};

// Merge arrays by unique _id to avoid duplicates during polling
function uniqueById<T extends { _id: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const item of arr) {
    if (!seen.has(item._id)) {
      seen.add(item._id);
      out.push(item);
    }
  }
  return out;
}

/* ============================================================
   Component
   ============================================================ */
export default function Messages() {
  // Left pane: match list
  const [matches, setMatches] = useState<Match[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);

  // Selection
  const [selectedMatchId, setSelectedMatchId] = useState<string | null>(null);

  // Right pane: thread
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  // Composer
  const [msgInput, setMsgInput] = useState("");
  const [sending, setSending] = useState(false);

  // Polling control and visibility pause
  const pollRef = useRef<number | null>(null);

  // Me: derive a stable id from local user or JWT claims
  const token = getToken();
  const meId = useMemo(() => {
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

  // If not logged in, avoid unauthorized calls and redirect path remains explicit
  if (!token) {
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

  /* ---------------- Matches: load on mount ---------------- */
  useEffect(() => {
    let mounted = true;
    const controller = new AbortController();

    (async () => {
      try {
        setLoadingMatches(true);

        const res = await axios.get(apiUrl("/match/matches"), {
          // Auth header is redundant with interceptor but kept as defense in depth
          headers: authHeader(),
          signal: controller.signal,
        });

        if (!mounted) return;

        const list = normalizeMatches(res.data);

        // Filter to only threads that the current user belongs to (least-privilege UI)
        const safeList = meId
          ? list.filter((m) => {
              const ua = idOf(m.userA);
              const ub = idOf(m.userB);
              return String(ua) === String(meId) || String(ub) === String(meId);
            })
          : list;

        setMatches(safeList);

        // Auto select first valid match
        const firstId = safeList[0]?._id ?? null;
        if (!selectedMatchId && firstId && isValidObjectId(firstId)) {
          setSelectedMatchId(firstId);
        }
      } catch (err: any) {
        // Generic toast avoids leaking backend internals
        console.error("Failed to load matches");
        toast.error("Could not load matches");
      } finally {
        if (mounted) setLoadingMatches(false);
      }
    })();

    return () => {
      mounted = false;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meId]);

  /* ---------------- Messages: load and poll ---------------- */
  useEffect(() => {
    if (!selectedMatchId || !isValidObjectId(selectedMatchId)) return;

    // Pause polling when tab is hidden to reduce load and avoid odd races
    const visibilityHandler = () => {
      if (document.hidden && pollRef.current) {
        window.clearInterval(pollRef.current);
        pollRef.current = null;
      } else if (!document.hidden && !pollRef.current) {
        pollRef.current = window.setInterval(load, 3_000);
      }
    };
    document.addEventListener("visibilitychange", visibilityHandler);

    const controller = new AbortController();

    const load = async () => {
      // Verify the selection still belongs to the current user before calling
      const match = matches.find((m) => m._id === selectedMatchId);
      if (meId && match) {
        const ua = idOf(match.userA);
        const ub = idOf(match.userB);
        const member =
          String(ua) === String(meId) || String(ub) === String(meId);
        if (!member) {
          toast.error("You do not have access to this conversation");
          return;
        }
      }

      try {
        setLoadingMsgs(true);

        const res = await axios.get(apiUrl(`/chat/${selectedMatchId}`), {
          params: { limit: 50 },
          headers: authHeader(),
          signal: controller.signal,
        });

        const list = normalizeMessages(res.data);

        // De-duplicate and keep chronological order for safe rendering
        const deduped = uniqueById(
          list.sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );

        setMsgs(deduped);
      } catch (err: any) {
        console.error("Failed to load messages");
        toast.error("Could not load messages");
      } finally {
        setLoadingMsgs(false);
      }
    };

    // Initial load
    load();

    // Start polling
    if (pollRef.current) window.clearInterval(pollRef.current);
    pollRef.current = window.setInterval(load, 3_000);

    return () => {
      document.removeEventListener("visibilitychange", visibilityHandler);
      if (pollRef.current) window.clearInterval(pollRef.current);
      pollRef.current = null;
      controller.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMatchId, matches, meId]);

  /* ---------------- Send message ---------------- */
  async function sendMessage() {
    if (sending) return; // simple client-side throttle
    if (!selectedMatchId || !isValidObjectId(selectedMatchId)) return;

    const body = msgInput.trim();

    // Respect server-side maxlength and avoid empty sends
    if (!body) return;
    if (body.length > 1000) {
      toast.error("Message is too long");
      return;
    }

    // Enforce membership client-side before POST (authorization is still server-side)
    const match = matches.find((m) => m._id === selectedMatchId);
    if (meId && match) {
      const ua = idOf(match.userA);
      const ub = idOf(match.userB);
      const member = String(ua) === String(meId) || String(ub) === String(meId);
      if (!member) {
        toast.error("You do not have access to this conversation");
        return;
      }
    }

    try {
      setSending(true);

      const res = await axios.post<{ ok: boolean; message?: Message }>(
        apiUrl(`/chat/${selectedMatchId}`),
        { body },
        { headers: authHeader() }
      );

      // If the API returns the created message, append optimistically; else refetch
      if (res?.data?.ok && res?.data?.message) {
        setMsgs((m) => uniqueById([...m, res.data.message!]));
        setMsgInput("");
      } else {
        // Fallback to read-after-write for consistency
        const reload = await axios.get(apiUrl(`/chat/${selectedMatchId}`), {
          params: { limit: 50 },
          headers: authHeader(),
        });
        setMsgs(
          normalizeMessages(reload.data).sort(
            (a, b) =>
              new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          )
        );
        setMsgInput("");
      }
    } catch (err: any) {
      console.error("Send failed");
      toast.error("Could not send message");
    } finally {
      setSending(false);
    }
  }

  /* ---------------- UI helpers ---------------- */
  const otherUserIdOf = (m: Match) => {
    if (!meId) return null;
    const ua = idOf(m.userA);
    const ub = idOf(m.userB);
    return String(ua) === String(meId) ? ub : ua;
  };

  /* ============================================================
     Render (safe text rendering; no HTML injection)
     ============================================================ */
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
                          onClick={() =>
                            isValidObjectId(m._id)
                              ? setSelectedMatchId(m._id)
                              : toast.error("Invalid conversation id")
                          }
                        >
                          <ListItemText
                            primary={
                              otherId
                                ? `Match ${String(otherId).slice(0, 6)}…`
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
                    const mine =
                      meId && String(idOf(m.senderId)) === String(meId);
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
                        {/* Safe text rendering only */}
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

              {/* Composer (client validates length and throttles sends) */}
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
                      inputProps={{ maxLength: 1000 }}
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
                      disabled={sending || !msgInput.trim()}
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
