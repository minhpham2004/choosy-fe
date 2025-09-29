import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/auth/login", { email, password });

      const token = res.data.accessToken;
      localStorage.setItem("accessToken", token);

      toast.success("Login successful!");
      console.log("Logged in! Token saved:", token);

      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } catch (err: any) {
      const message =
        err.response?.data?.message || err.response?.data || err.message;
      toast.error(`Login failed: ${message}`);
      console.error("Login failed:", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <Button
              loading={loading}
              variant="contained"
              fullWidth
              onClick={handleLogin}
            >
              Sign in
            </Button>

            <Typography>
              Don't have an account? <a href="/register">Register Now.</a>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
