// Minh Pham
import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Stack,
  Container,
  Chip,
  CircularProgress,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

// Profile type for users who liked the current user
type Profile = {
  userId: string;
  displayName: string;
  age: number;
  bio?: string;
  avatarUrl?: string;
  interests: string[];
  areaKey?: string;
};

export default function Likes() {
  const [likes, setLikes] = useState<Profile[]>([]); // List of people who liked you
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch list of likes from the server
  const fetchLikes = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/match/likes");
      setLikes(res.data || []);
    } catch (err) {
      toast.error("Failed to load likes");
    } finally {
      setLoading(false);
    }
  };

  // Fetch likes on first render
  useEffect(() => {
    fetchLikes();
  }, []);

  // Handle like-back or skip actions
  const swipeBack = async (toUserId: string, action: "like" | "dislike") => {
    try {
      const res = await axios.post("/match/swipe", { toUserId, action });
      if (res.data?.matched) {
        toast.success("🎉 It's a match!");
      } else if (action === "like") {
        toast.success("You liked them back!");
      } else {
        toast("Skipped");
      }

      // Remove that user from the list
      setLikes((prev) => prev.filter((p) => p.userId !== toUserId));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <Box
      sx={{
        flexGrow: 1,
        display: "flex",
        justifyContent: "center",
        bgcolor: "background.default",
        textAlign: "left",
      }}
    >
      <Container maxWidth="sm" sx={{ mb: 6, mt: 6 }}>
        <Typography
          variant="h4"
          align="center"
          sx={{ mb: 4, fontWeight: 600, color: "black" }}
        >
          People Who Liked You
        </Typography>

        {/* Loading spinner */}
        {loading ? (
          <Stack alignItems="center" sx={{ mt: 6 }}>
            <CircularProgress />
          </Stack>
        ) : likes.length === 0 ? (
          // Empty state
          <Typography align="center" color="text.secondary">
            Nobody yet… check back later 👀
          </Typography>
        ) : (
          // List of profiles
          <Stack spacing={5}>
            {likes.map((profile) => (
              <motion.div
                key={profile.userId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {/* Profile card */}
                <Card
                  sx={{
                    position: "relative",
                    borderRadius: 4,
                    overflow: "hidden",
                    height: 500,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  }}
                >
                  <CardMedia
                    component="img"
                    image={profile.avatarUrl || "/blank profile.png"}
                    alt={profile.displayName}
                    sx={{
                      height: "100%",
                      width: "100%",
                      objectFit: "cover",
                      filter: "brightness(0.95)",
                    }}
                  />

                  {/* Overlay info section */}
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: "100%",
                      background:
                        "linear-gradient(to top, rgba(0,0,0,0.75), rgba(0,0,0,0.1))",
                      color: "#fff",
                      p: 3,
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Typography variant="h6" sx={{ fontWeight: 700 }}>
                      {profile.displayName}, {profile.age}
                    </Typography>

                    {profile.areaKey && (
                      <Typography variant="body2" sx={{ opacity: 0.85 }}>
                        {profile.areaKey}
                      </Typography>
                    )}

                    {profile.bio && (
                      <Typography
                        variant="body2"
                        sx={{
                          mt: 1,
                          lineHeight: 1.4,
                          opacity: 0.9,
                          maxWidth: "90%",
                        }}
                      >
                        {profile.bio.length > 100
                          ? profile.bio.slice(0, 100) + "..."
                          : profile.bio}
                      </Typography>
                    )}

                    {/* Interest tags */}
                    <Stack
                      direction="row"
                      spacing={0.8}
                      sx={{ flexWrap: "wrap", mt: 1 }}
                    >
                      {profile.interests?.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{
                            bgcolor: "rgba(255,255,255,0.15)",
                            color: "#fff",
                            fontSize: "0.75rem",
                          }}
                        />
                      ))}
                    </Stack>
                  </Box>
                </Card>

                {/* Action buttons */}
                <Stack
                  direction="row"
                  justifyContent="center"
                  alignItems="center"
                  spacing={3}
                  sx={{ mt: 3 }}
                >
                  <Button
                    variant="contained"
                    onClick={() => swipeBack(profile.userId, "dislike")}
                    disabled={loading}
                    sx={{
                      minWidth: 120,
                      py: 1.2,
                      bgcolor: "error.main",
                      "&:hover": { bgcolor: "error.dark" },
                    }}
                  >
                    Skip
                  </Button>

                  <Button
                    variant="contained"
                    onClick={() => swipeBack(profile.userId, "like")}
                    disabled={loading}
                    sx={{
                      minWidth: 120,
                      py: 1.2,
                      bgcolor: "success.main",
                      "&:hover": { bgcolor: "success.dark" },
                    }}
                  >
                    Like Back
                  </Button>
                </Stack>
              </motion.div>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
