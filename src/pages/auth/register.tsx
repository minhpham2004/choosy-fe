// Nathan Ravasini & Rayan El-Taher
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
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { AREA_KEYS } from "../../constant/area";
import { INTEREST_KEYS } from "../../constant/interest";
import axios from "axios";
import toast from "react-hot-toast";
import { uploadToCloudinary } from "../../utils/upload-image";

// Types & Validation Rules
type registerForm = {
  email: string;
  name: string;
  password: string;
  age: string;
  areaKey: string;
  displayName: string;
  bio: string;
  interests: string[]; 
  avatarUrl: string;
};

type registerErrors = Partial<
  Record< "email" | "password" | "age" | "areaKey" | "displayName" | "bio" | "interests", string>
>;

const emailFormat = /^[^\s@]+@[^\s@]+\.[^\s@]+$/; //Email Regular Expression
const passwordRule = /^(?=.*[A-Za-z])(?=.*\d).{8,}$/; // letter + number, at least 8 characters
const MIN_AGE = 18; //University Students are typically over 18

export default function Register() {
  // Avatar state
  const [photoPreview, setPhotoPreview] = React.useState<string | null>(null);
  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  
  // Form UX state
  const [form, setForm] = React.useState<registerForm>({
    email: "",
    name: "",
    password: "",
    age: "",
    areaKey: "",
    displayName: "",
    bio: "",
    interests: [],
    avatarUrl: "",
  });

  const [errors, setErrors] = useState<registerErrors>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const hasAvatar = !!photoFile || !!form.avatarUrl;

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

  // Centralised validator
  function validate(values: Partial<registerForm> = {}): registerErrors {
    const v = { ...form, ...values };
    const next: registerErrors = {};

    //Email
    if (!v.email) next.email = "Email is required";
    else if (!emailFormat.test(v.email)) next.email = "Enter a vaild email address";

    //Password
    if (!v.password) next.password = "Password is required";
    else if (!passwordRule.test(v.password)) 
      next.password = "At least 8 characters, with a letter and a number";

    //Display Name
    if (!v.displayName) next.displayName = "A display name is required";

    //Age
    if (!v.age?.toString().trim()) next.age = "Age is required";
    else {
      const n = Number(v.age);
      if (!Number.isFinite(n) || !Number.isInteger(n)) next.age = "Enter a whole number";
      else if (n < MIN_AGE) next.age = `You must be at least ${MIN_AGE}`;
    }
     
    // Unused fields
    //Bio
    // if (v.bio && v.bio.length > 500) next.bio = "Bio must be 500 characters or less";

    // type AreaKey = typeof AREA_KEYS[number];
    // type Interest = typeof INTEREST_KEYS[number];

    return next;
  }   

  function handleChange<T extends keyof registerForm>(field: T, value: registerForm[T]) {
    const nextForm = { ...form, [field]: value};
    setForm(nextForm);

    // Revalidate the changed field once the user submits
    if (!submitted) return;
    setErrors((prev) => ({ ...prev, ...validate({ [field]: value }) }));
  }

  async function handleSubmit() {
    setSubmitted(true);
    const next = validate();
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!hasAvatar) {
      toast.error("Please upload a profile photo");
      return;
    }
    
    setLoading(true);
    try {
      let avatarUrl = form.avatarUrl;
      
      if (photoFile) {
        toast.loading("Uploading photo...");
        avatarUrl = await uploadToCloudinary(photoFile);
        toast.dismiss();
        toast.success("Photo Uploaded");
      }
      
      const payload = {
        ...form,
        age: Number(form.age),
        avatarUrl,
    };

    const res = await axios.post("/user", payload);
    
    if (avatarUrl) localStorage.setItem("pendingAvatarUrl", avatarUrl);
      
          
    console.log("✅ User created:", res.data);
    toast.success("User created successfully! Please Login");
    window.location.assign("/login");

  } catch (err: any) {
    const message =
      err.response?.data?.message || 
      err.response?.data ||
      err.message || "Failed to create user";
      toast.error(message);
    console.error("Failed to create user:", message);    
  } finally {
    setLoading(false);
  }
}  


  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create account
          </Typography>

          <Stack spacing={2}>
            {/* Email */}
            <TextField
              label="Email"
              type="email"
              fullWidth
              required
              value={form.email}
              onChange={(e) => handleChange("email", e.target.value)}
              error={submitted && !!errors.email}
              helperText={submitted ? errors.email : ""}
            />
            {/* Name */}
            <TextField
              label="Name"
              fullWidth
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
            {/* Password */}
            <TextField
              label="Password"
              type="password"
              fullWidth
              value={form.password}
              onChange={(e) => handleChange("password", e.target.value)}
              error = {submitted && !!errors.password}
              helperText = {submitted ? errors.password : "At least 8 chars, must contain a letter & number"}
            />

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

            {/* Profile fields */}
            {/* Name */}
            <TextField
              label="Display name"
              fullWidth
              required
              value={form.displayName}
              onChange={(e) => handleChange("displayName", e.target.value)}
              error={submitted && !!errors.displayName}
              helperText={submitted ? errors.displayName : ""}
            />
            {/* Age */}
            <TextField
              label="Age"
              type="number"
              fullWidth
              required
              value={form.age}
              onChange={(e) => handleChange("age", e.target.value)}
              error={submitted && !!errors.age}
              helperText={submitted ? errors.age : ""}
            />
            {/* Bio */}
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

            <Button 
              variant="contained" 
              fullWidth 
              onClick={handleSubmit}
              loading={loading}
              disabled={!hasAvatar}
            >
              Sign up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
