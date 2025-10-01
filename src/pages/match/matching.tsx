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
  Badge,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { ArrowForwardSharp } from "@mui/icons-material";
import ReportButton from "./report";

type Profile = {
  userId: string;
  displayName: string;
  age: number;
  bio?: string;
  avatarUrl?: string;
  interests: string[];
  areaKey?: string;
};

export default function Matching() {
  const [candidate, setCandidate] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCandidate();
    fetchLikes();
  }, []);

  const fetchCandidate = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/match/candidate");
      setCandidate(res.data || null);
    } catch (err) {
      setCandidate(null);
      toast.error("No candidates found");
    } finally {
      setLoading(false);
    }
  };

  const fetchLikes = async () => {
    try {
      const res = await axios.get("/likes");
      setLikesCount(res.data?.length || 0);
    } catch (err) {
      console.error(err);
      setLikesCount(0);
    }
  };

  const swipe = async (action: "like" | "dislike") => {
    if (!candidate) return;
    try {
      const res = await axios.post("/match/swipe", {
        toUserId: candidate.userId,
        action,
      });

      if (res.data?.matched) {
        toast.success(`🎉 You matched with ${candidate.displayName}!`);
      } else if (action === "like") {
        toast.success(`You liked ${candidate.displayName}`);
      } else {
        toast(`You skipped ${candidate.displayName}`);
      }
    } catch (err) {
      toast.error("Swipe failed");
    } finally {
      fetchCandidate();
      fetchLikes();
    }
  };

  const blockUser = async () => {
  if (!candidate) return;
  try {
    await axios.post("/match/block", { toUserId: candidate.userId });
    toast.success(`${candidate.displayName} has been blocked`);
  } catch (err) {
    toast.error("Failed to block user");
  } finally {
    fetchCandidate();
    fetchLikes();
  }
};

  return (
    <Box sx={{ flexGrow: 1, display: "flex", justifyContent: "center" }}>
      <Container maxWidth="sm" sx={{ mb: 4, mt: 6 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
        >
          <Typography variant="h4" sx={{ fontWeight: 600 }}>
            Find your match
          </Typography>

          <Badge badgeContent={likesCount || "0"} color="primary">
            <Button
              onClick={() => navigate("/likes")}
              variant="outlined"
              sx={{ minWidth: 100, py: 1 }}
              endIcon={<ArrowForwardSharp />}
            >
              Your Likes
            </Button>
          </Badge>
        </Stack>

        {candidate ? (
          <Card
            sx={{
              borderRadius: 4,
              overflow: "hidden",
              boxShadow: 6,
            }}
          >
            <CardMedia
              component="img"
              image={candidate.avatarUrl || "/blank profile.png"}
              alt={candidate.displayName}
              sx={{
                height: 400,
                objectFit: "cover",
              }}
            />

            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: 700 }}>
                {candidate.displayName}, {candidate.age}
              </Typography>
              <Typography
                variant="subtitle1"
                color="text.secondary"
                sx={{ mb: 1 }}
              >
                {candidate.areaKey}
              </Typography>
              <Typography variant="body1" sx={{ mb: 2 }}>
                {candidate.bio}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                sx={{ flexWrap: "wrap", mb: 3 }}
              >
                {candidate.interests?.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                ))}
              </Stack>

              <Stack
              direction="row"
              spacing={3}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                onClick={() => swipe("dislike")}
                disabled={loading}
                variant="contained"
                sx={{
                  minWidth: 100,
                  py: 1.2,
                  bgcolor: "error.main",
                  "&:hover": { bgcolor: "error.dark" },
                }}
              >
                Skip
              </Button>

              <Button
                onClick={fetchCandidate}
                disabled={loading}
                variant="contained"
                sx={{
                  minWidth: 100,
                  py: 1.2,
                  bgcolor: "grey.500",
                  "&:hover": { bgcolor: "grey.600" },
                }}
              >
                Next
              </Button>

              <Button
                onClick={() => swipe("like")}
                disabled={loading}
                variant="contained"
                sx={{
                  minWidth: 100,
                  py: 1.2,
                  bgcolor: "success.main",
                  "&:hover": { bgcolor: "success.dark" },
                }}
              >
                Like
              </Button>
            </Stack>

            <Stack
              direction="row"
              spacing={3}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              <Button
                onClick={blockUser}
                disabled={loading}
                variant="contained"
                sx={{
                  minWidth: 100,
                  py: 1.2,
                  bgcolor: "warning.main",
                  "&:hover": { bgcolor: "warning.dark" },
                }}
              >
                Block
              </Button>

              <ReportButton candidateId={candidate.userId} />

            </Stack>

            </CardContent>
          </Card>
        ) : (
          <Card sx={{ borderRadius: 4, p: 4, textAlign: "center" }}>
            <Typography variant="h6" gutterBottom>
              No more candidates
            </Typography>
            <Button onClick={fetchCandidate} variant="outlined" sx={{ mt: 2 }}>
              Refresh
            </Button>
          </Card>
        )}
      </Container>
    </Box>
  );
}
