import * as React from "react";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import axios from "axios";
import toast from "react-hot-toast";
import { AREA_KEYS } from "../../constant/area";
import { INTEREST_KEYS } from "../../constant/interest";
import { uploadToCloudinary } from "../../utils/upload-image";

export const DISTANCE_TIERS = ["near", "mid", "far"] as const;

export const GENDER_OPTIONS = [
  "Man",
  "Woman",
  "Non-binary",
  "Prefer not to say",
  "Other",
] as const;

export default function Profile() {
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const [form, setForm] = React.useState({
    displayName: "",
    age: "",
    bio: "",
    avatarUrl: "",
    areaKey: "",
    discoverable: true,
    gender: "",
    interests: [] as string[],
    prefs: {
      minAge: 18,
      maxAge: 99,
      allowedAreas: [] as string[],
      maxDistanceTier: "near",
    },
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get("/profiles/me");
        const profile = res.data;

        setForm({
          displayName: profile.displayName || "",
          age: profile.age?.toString() || "",
          bio: profile.bio || "",
          avatarUrl: profile.avatarUrl || "",
          areaKey: profile.areaKey || "",
          discoverable: profile.discoverable ?? true,
          gender: profile.gender || "", 
          interests: profile.interests || [],
          prefs: {
            minAge: profile.prefs?.minAge ?? 18,
            maxAge: profile.prefs?.maxAge ?? 99,
            allowedAreas: profile.prefs?.allowedAreas || [],
            maxDistanceTier: profile.prefs?.maxDistanceTier || "near",
          },
        });

        if (profile.avatarUrl) {
          setPhotoPreview(profile.avatarUrl); // Show saved avatar
        }
      } catch (err: any) {
        toast.error("Failed to load profile");
        console.error(err);
      }
    };
    fetchProfile();
  }, []);

  const pickFile = () => fileInputRef.current?.click();
  const fileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!/^image\/(png|jpe?g|gif|webp|bmp|svg\+xml)$/.test(file.type)) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please choose an image under 5MB.");
      return;
    }
    const nextUrl = URL.createObjectURL(file);
    if (photoPreview && !form.avatarUrl) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(nextUrl);
  };
  const clearPhoto = () => {
    if (photoPreview && !form.avatarUrl) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setPhotoFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };
  const handlePrefsChange = (field: string, value: any) => {
    setForm((prev) => ({
      ...prev,
      prefs: { ...prev.prefs, [field]: value },
    }));
  };

  const saveProfile = async () => {
    try {
      let avatarUrl = form.avatarUrl;

      if (photoFile) {
        toast.loading("Uploading photo...");
        avatarUrl = await uploadToCloudinary(photoFile);
        toast.dismiss();
        toast.success("Photo uploaded!");
      }

      const payload = {
        ...form,
        age: Number(form.age),
        avatarUrl,
        gender: form.gender || null,
        prefs: {
          ...form.prefs,
          minAge: Number(form.prefs.minAge),
          maxAge: Number(form.prefs.maxAge),
        },
      };

      await axios.put("/profiles", payload);

      toast.success("Profile saved!");
    } catch (err: any) {
      toast.dismiss();
      toast.error(err.response?.data?.message || "Error saving profile");
    }
  };

  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            My Profile
          </Typography>

          <Stack spacing={2}>
            {/* Avatar upload */}
            <Box sx={{ textAlign: "center" }}>
              <Avatar
                src={photoPreview ?? undefined}
                alt="Profile picture"
                sx={{ width: 96, height: 96, mx: "auto", mb: 1 }}
              />
              <Stack direction="row" spacing={1} justifyContent="center">
                <Button variant="outlined" onClick={pickFile}>
                  {photoPreview ? "Change photo" : "Upload photo"}
                </Button>
                {photoPreview && (
                  <Button variant="text" color="error" onClick={clearPhoto}>
                    Remove
                  </Button>
                )}
              </Stack>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                hidden
                onChange={fileChange}
              />
            </Box>

            <TextField
              label="Display Name"
              fullWidth
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
            />
            <TextField
              label="Age"
              type="number"
              fullWidth
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
            />
            
            <TextField
              select
              label="Gender"
              fullWidth
              value={form.gender}
              onChange={(e) => handleChange("gender", e.target.value)}
            >
              {GENDER_OPTIONS.map((g) => (
                <MenuItem key={g} value={g}>
                  {g}
                </MenuItem>
              ))}
            </TextField>
          
            <TextField
              label="Bio"
              multiline
              minRows={3}
              fullWidth
              value={form.bio}
              onChange={(e) => handleChange("bio", e.target.value)}
            />

            {/* AreaKey dropdown */}
            <TextField
              select
              label="Area"
              fullWidth
              value={form.areaKey}
              onChange={(e) => handleChange("areaKey", e.target.value)}
            >
              {AREA_KEYS.map((area) => (
                <MenuItem key={area} value={area}>
                  {area}
                </MenuItem>
              ))}
            </TextField>

            {/* Discoverable toggle */}
            <FormControlLabel
              control={
                <Switch
                  checked={form.discoverable}
                  onChange={(e) =>
                    handleChange("discoverable", e.target.checked)
                  }
                />
              }
              label="Discoverable"
            />

            {/* Interests multi select */}
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

            {/* Preferences */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>
              Preferences
            </Typography>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Min Age"
                type="number"
                value={form.prefs.minAge}
                onChange={(e) => handlePrefsChange("minAge", e.target.value)}
              />
              <TextField
                label="Max Age"
                type="number"
                value={form.prefs.maxAge}
                onChange={(e) => handlePrefsChange("maxAge", e.target.value)}
              />
            </Stack>

            <TextField
              select
              label="Max Distance"
              fullWidth
              value={form.prefs.maxDistanceTier}
              onChange={(e) =>
                handlePrefsChange("maxDistanceTier", e.target.value)
              }
            >
              {DISTANCE_TIERS.map((tier) => (
                <MenuItem key={tier} value={tier}>
                  {tier}
                </MenuItem>
              ))}
            </TextField>

            <Autocomplete
              multiple
              options={AREA_KEYS as unknown as string[]}
              value={form.prefs.allowedAreas}
              onChange={(_, value) => handlePrefsChange("allowedAreas", value)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Allowed Areas"
                  placeholder="Select..."
                />
              )}
            />

            <Button variant="contained" fullWidth onClick={saveProfile}>
              Save Profile
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
