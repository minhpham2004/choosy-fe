import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AREA_KEYS } from "../../constant/area";
import { INTEREST_KEYS } from "../../constant/interest";
import axios from "axios";
import toast from "react-hot-toast";

export default function Register() {
  const [form, setForm] = useState({
    email: "",
    name: "",
    password: "",
    age: "",
    areaKey: "",
    displayName: "",
    bio: "",
    interests: [] as string[],
  });

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    const payload = {
      ...form,
      age: Number(form.age),
    };

    try {
      const res = await axios.post("/user", payload);
      console.log("✅ User created:", res.data);
      toast.success("User created successfully!");
    } catch (err) {
      console.error("Failed to create user:", err);
      toast.error("Failed to create user");
    }
  };

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create account
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
            />
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              helperText="At least 8 chars, must contain a letter & number"
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
            />

            {/* Profile fields */}
            <TextField
              label="Display name"
              fullWidth
              required
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
            />
            <TextField
              label="Age"
              type="number"
              fullWidth
              required
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
            />
            <TextField
              label="Bio"
              fullWidth
              multiline
              minRows={3}
              inputProps={{ maxLength: 500 }}
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />

            {/* AreaKey select */}
            <TextField
              select
              label="Area"
              value={form.areaKey}
              onChange={(e) => handleChange("areaKey", e.target.value)}
              fullWidth
              required
            >
              {AREA_KEYS.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </TextField>

            {/* Interests autocomplete */}
            <Autocomplete
              multiple
              options={INTEREST_KEYS as unknown as string[]}
              value={form.interests}
              onChange={(_, value) => handleChange("interests", value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Interests"
                  placeholder="Select..."
                />
              )}
            />

            <Button variant="contained" fullWidth onClick={handleSubmit}>
              Sign up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
