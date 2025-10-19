import {
  Box,
  Card,
  CardMedia,
  Typography,
  Button,
  Stack,
  Container,
  IconButton,
  Chip,
  Badge,
  Tooltip,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import {
  Favorite,
  Clear,
  ArrowForwardSharp,
  Block,
  MoreVert,
  Flag,
} from "@mui/icons-material";
import ReportButton from "./report";
import { motion } from "framer-motion";

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
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();

  const menuOpen = Boolean(anchorEl);
  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

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
      const res = await axios.get("/match/likes");
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
        toast.success(`Matched with ${candidate.displayName}!`);
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
      handleMenuClose();
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
        {/* Header */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 3 }}
        >
          <Typography variant="h5" sx={{ fontWeight: 600 }}>
            Discover
          </Typography>

          <Badge badgeContent={likesCount || "0"} color="primary">
            <Button
              onClick={() => navigate("/likes")}
              variant="outlined"
              size="small"
              endIcon={<ArrowForwardSharp />}
              sx={{ textTransform: "none" }}
            >
              Your Likes
            </Button>
          </Badge>
        </Stack>

        {/* Candidate Card */}
        {candidate ? (
          <motion.div
            key={candidate.userId}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
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
                image={candidate.avatarUrl || "/blank profile.png"}
                alt={candidate.displayName}
                sx={{
                  height: "100%",
                  width: "100%",
                  objectFit: "cover",
                  filter: "brightness(0.95)",
                }}
              />

              {/* Gradient + Text Overlay */}
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
                  {candidate.displayName}, {candidate.age}
                </Typography>

                {candidate.areaKey && (
                  <Typography variant="body2" sx={{ opacity: 0.85 }}>
                    {candidate.areaKey}
                  </Typography>
                )}

                {candidate.bio && (
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 1,
                      lineHeight: 1.4,
                      opacity: 0.9,
                      maxWidth: "90%",
                    }}
                  >
                    {candidate.bio.length > 100
                      ? candidate.bio.slice(0, 100) + "..."
                      : candidate.bio}
                  </Typography>
                )}

                <Stack
                  direction="row"
                  spacing={0.8}
                  sx={{ flexWrap: "wrap", mt: 1 }}
                >
                  {candidate.interests?.map((tag) => (
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

            {/* Action Buttons */}
            <Stack
              direction="row"
              justifyContent="center"
              alignItems="center"
              spacing={3}
              sx={{ mt: 3 }}
            >
              <Tooltip title="Skip / Dislike" arrow>
                <IconButton
                  onClick={() => swipe("dislike")}
                  disabled={loading}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "error.main",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <Clear sx={{ fontSize: 36 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="Like" arrow>
                <IconButton
                  onClick={() => swipe("like")}
                  disabled={loading}
                  sx={{
                    width: 64,
                    height: 64,
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "success.main",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <Favorite sx={{ fontSize: 36 }} />
                </IconButton>
              </Tooltip>

              <Tooltip title="More Options" arrow>
                <IconButton
                  onClick={handleMenuOpen}
                  sx={{
                    width: 60,
                    height: 60,
                    bgcolor: "rgba(255,255,255,0.9)",
                    color: "text.primary",
                    boxShadow: "0 3px 8px rgba(0,0,0,0.15)",
                    "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                  }}
                >
                  <MoreVert sx={{ fontSize: 28 }} />
                </IconButton>
              </Tooltip>

              <Menu
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleMenuClose}
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                transformOrigin={{ vertical: "bottom", horizontal: "right" }}
              >
                <MenuItem onClick={blockUser}>
                  <ListItemIcon>
                    <Block fontSize="small" color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Block User" />
                </MenuItem>

                <MenuItem>
                  <ListItemIcon>
                    <Flag fontSize="small" color="error" />
                  </ListItemIcon>
                  <ListItemText
                    primary={<ReportButton candidateId={candidate.userId} />}
                  />
                </MenuItem>
              </Menu>
            </Stack>
          </motion.div>
        ) : (
          <Card
            sx={{
              borderRadius: 4,
              p: 4,
              textAlign: "center",
              boxShadow: "0 4px 10px rgba(0,0,0,0.05)",
            }}
          >
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
