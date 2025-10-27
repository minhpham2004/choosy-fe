// Nathan Ravasini & Anthony Alexis
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

type LoginErrors = {
  email?: string;
  password?: string;
};

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; // Email Regular Expression

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<LoginErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  function validate(values = { email, password }) {
    const next: LoginErrors = {};
    if (!values.email) next.email = "Email is required";
    else if (!emailFormat.test(values.email))
      next.email = "Enter a valid email address";

    if (!values.password) next.password = "Password is required";
    else if (values.password.length < 8)
      next.password = "Password must be 8 or more characters";

    return next;
  }

  async function handleLogin() {
    setSubmitted(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", { email, password });

      const token = data?.accessToken;
      const user = data?.user;

      if (!token) throw new Error("No token returned");

      if (user?.status === "banned") {
        toast.error("Your account has been banned.");
        return;
      }

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
  }

  function onEmailChange(v: string) {
    setEmail(v);
    if (!submitted) return;
    setErrors((prev) => ({ ...prev, ...validate({ email: v, password }) }));
  }

  function onPasswordChange(v: string) {
    setPassword(v);
    if (!submitted) return;
    setErrors((prev) => ({ ...prev, ...validate({ email, password: v }) }));
  }

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
              onChange={(e) => onEmailChange(e.target.value)}
              error={submitted && !!errors.email}
              helperText={submitted ? errors.email : ""}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => onPasswordChange(e.target.value)}
              error={submitted && !!errors.password}
              helperText={submitted ? errors.password : ""}
            />

            <Button
              disabled={loading}
              variant="contained"
              fullWidth
              onClick={handleLogin}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>

            <Typography>
              Don&apos;t have an account?{" "}
              <a href="/register">Register Now.</a>
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
