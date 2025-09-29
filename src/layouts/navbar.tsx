import { AppBar, Box, Button, Toolbar, Typography } from "@mui/material";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import ChoosyLogo from "../assets/Choosy Icon.png";
import toast from "react-hot-toast";

export default function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    setIsLoggedIn(false);
    toast.success("Logged out");
    navigate("/login");
  };

  return (
    <AppBar
      position="static"
      elevation={1}
      sx={{ width: "100%", left: 0, right: 0 }}
    >
      <Toolbar>
        {/* Logo + Title Links*/}
        <Box
          component={RouterLink}
          to="/"
          sx={{
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
            color: "inherit",
            flexGrow: 1,
            "&:hover": { color: "inherit", background: "none" },
          }}
        >
          <Box
            component="img"
            src={ChoosyLogo}
            alt="Logo"
            sx={{ height: 40, mr: 1 }}
          />

          <Typography
            variant="h5"
            sx={{ flexGrow: 1, fontWeight: "bold", pr: 5 }}
          >
            Choosy
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">
            Dashboard
          </Button>
          <Button color="inherit" component={RouterLink} to="/matching">
            Matching
          </Button>
          <Button color="inherit" component={RouterLink} to="/profile">
            Profile
          </Button>
          <Button color="inherit" component={RouterLink} to="/messages">
            Messages
          </Button>

          {!isLoggedIn ? (
            <>
              <Button color="inherit" component={RouterLink} to="/login">
                Login
              </Button>
              <Button color="inherit" component={RouterLink} to="/register">
                Register
              </Button>
            </>
          ) : (
            <Button color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
