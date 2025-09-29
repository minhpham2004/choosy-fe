import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Container,
  CardMedia,
  Chip,
} from "@mui/material";
import { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

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
  const [likes, setLikes] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    fetchLikes();
  }, []);

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
      // Remove from local list
      setLikes((prev) => prev.filter((p) => p.userId !== toUserId));
    } catch (err) {
      toast.error("Action failed");
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Container maxWidth="md" sx={{ mb: 4, mt: 6 }}>
        <Typography
          variant="h4"
          gutterBottom
          align="center"
          sx={{ mb: 4, fontWeight: 600 }}
        >
          People Who Liked You
        </Typography>

        {likes.length === 0 && !loading ? (
          <Typography align="center" color="text.secondary">
            Nobody yet… check back later 👀
          </Typography>
        ) : (
          <Stack spacing={3}>
            {likes.map((profile) => (
              <Card
                key={profile.userId}
                sx={{
                  borderRadius: 3,
                  overflow: "hidden",
                  boxShadow: 4,
                }}
              >
                <CardMedia
                  component="img"
                  image={profile.avatarUrl || "/blank profile.png"}
                  alt={profile.displayName}
                  sx={{ height: 200, objectFit: "cover" }}
                />

                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {profile.displayName}, {profile.age}
                  </Typography>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {profile.areaKey}
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 2 }}>
                    {profile.bio}
                  </Typography>

                  <Stack
                    direction="row"
                    spacing={1}
                    sx={{ flexWrap: "wrap", mb: 2 }}
                  >
                    {profile.interests?.map((tag) => (
                      <Chip
                        key={tag}
                        label={tag}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Stack>

                  <Stack direction="row" spacing={2}>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "error.main",
                        "&:hover": { bgcolor: "error.dark" },
                      }}
                      onClick={() => swipeBack(profile.userId, "dislike")}
                    >
                      Skip
                    </Button>
                    <Button
                      fullWidth
                      variant="contained"
                      sx={{
                        bgcolor: "success.main",
                        "&:hover": { bgcolor: "success.dark" },
                      }}
                      onClick={() => swipeBack(profile.userId, "like")}
                    >
                      Like Back
                    </Button>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  );
}
