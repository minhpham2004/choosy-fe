import {
  Card, CardContent, Stack, Typography, Button, TextField, Alert, Dialog,
  DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

// Small helper so every call includes the bearer token
function auth() {
  const token = localStorage.getItem("accessToken");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

export default function AccountSettings() {
  return (
    <Stack flex={1} gap={3}>
      <EmailSection />
      <PasswordSection />
      <DangerZone />
    </Stack>
  );
}

// --- Email
function EmailSection() {
  const [email, setEmail] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [loading, setLoading] = useState(false);

  // Prefill from /user/me
  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get("/user/me", auth());
        setEmail(data.email || "");
      } catch {
        // ignore
      }
    })();
  }, []);

  async function saveEmail() {
    if (!newEmail) return toast.error("Enter a new email.");
    setLoading(true);
    try {
      const { data } = await axios.patch("/user/me", { email: newEmail }, auth());
      setEmail(data.email);
      setNewEmail("");
      toast.success("Email updated.");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Could not update email");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Email</Typography>
        <Stack direction={{ xs: "column", sm: "row" }} gap={2} alignItems="center">
          <TextField label="Current email" value={email} InputProps={{ readOnly: true }} sx={{ maxWidth: 420 }} />
          <TextField label="New email" value={newEmail} onChange={e => setNewEmail(e.target.value)} sx={{ maxWidth: 420 }} />
          <Button variant="contained" disabled={loading} onClick={saveEmail}>Save</Button>
        </Stack>
      </CardContent>
    </Card>
  );
}

// --- Password
function PasswordSection() {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");

  async function changePassword() {
    if (!current || !next) return toast.error("Enter current and new password.");
    if (next !== confirm) return toast.error("Passwords do not match.");
    try {
      await axios.post("/auth/change-password", { currentPassword: current, newPassword: next }, auth());
      toast.success("Password changed.");
      setCurrent(""); setNext(""); setConfirm("");
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Could not change password");
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>Password</Typography>
        <Stack gap={2} maxWidth={420}>
          <TextField label="Current password" type="password" value={current} onChange={e => setCurrent(e.target.value)} />
          <TextField label="New password" type="password" value={next} onChange={e => setNext(e.target.value)} />
          <TextField label="Confirm new password" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <Stack direction="row" gap={2}>
            <Button variant="contained" onClick={changePassword}>Change password</Button>
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}

// !!! Danger Zone (password-only confirmation + reauth)
function DangerZone() {
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function deleteAccount() {
    if (!password) return toast.error("Please enter your password to confirm.");
    setLoading(true);
    try {
      // 1) Re-authenticate
      await axios.post("/auth/reauth", { password }, auth());
      // 2) Delete account
      await axios.delete("/user/me", auth());
      // 3) Cleanup + redirect
      localStorage.removeItem("accessToken");
      toast.success("Account deleted");
      window.location.href = "/login";
    } catch (e: any) {
      toast.error(e?.response?.data?.message ?? "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card variant="outlined" sx={{ borderColor: "error.main" }}>
      <CardContent>
        <Typography variant="h6" color="error" gutterBottom>Danger Zone</Typography>
        <Typography color="text.secondary" gutterBottom>
          Permanently delete your account and all associated data.
        </Typography>
        <Button color="error" variant="contained" onClick={() => setOpen(true)}>Delete account</Button>

        <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
          <DialogTitle>Confirm account deletion</DialogTitle>
          <DialogContent>
            <Alert severity="error" sx={{ mb: 2 }}>
              This action is <b>permanent</b> and cannot be undone.
            </Alert>
            <Typography sx={{ mb: 2 }}>
              To confirm, please enter your password below. This ensures that only you can delete your account.
            </Typography>
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button color="error" variant="contained" disabled={loading || !password} onClick={deleteAccount}>
              {loading ? "Deleting..." : "Delete account"}
            </Button>
          </DialogActions>
        </Dialog>
      </CardContent>
    </Card>
  );
}
