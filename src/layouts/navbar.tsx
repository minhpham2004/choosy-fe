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

        <Box
          sx={{
            display: "flex",
            gap: 2,
            "& .nav-btn": {
              position: "relative",
              fontWeight: 500,
              letterSpacing: 0.3,
              textTransform: "none",
              transition: "all 0.25s ease",
              "&::after": {
                content: '""',
                position: "absolute",
                bottom: 2,
                left: 0,
                width: 0,
                height: 2,
                bgcolor: "primary.main",
                borderRadius: 2,
                transition: "width 0.3s ease",
              },
              "&:hover": {
                transform: "translateY(-1px)",
                color: "black",
                textDecoration: "none",
                "&::after": {
                  width: "100%",
                },
              },
            },
          }}
        >
          <Button
            className="nav-btn"
            color="inherit"
            component={RouterLink}
            to="/"
          >
            Dashboard
          </Button>
          <Button
            className="nav-btn"
            color="inherit"
            component={RouterLink}
            to="/matching"
          >
            Matching
          </Button>
          <Button
            className="nav-btn"
            color="inherit"
            component={RouterLink}
            to="/profile"
          >
            Profile
          </Button>
          <Button
            className="nav-btn"
            color="inherit"
            component={RouterLink}
            to="/messages"
          >
            Messages
          </Button>

          {!isLoggedIn ? (
            <>
              <Button
                className="nav-btn"
                color="inherit"
                component={RouterLink}
                to="/login"
              >
                Login
              </Button>
              <Button
                className="nav-btn"
                color="inherit"
                component={RouterLink}
                to="/register"
                sx={{
                  borderRadius: 2,
                  borderWidth: 1.5,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-1px)",
                  },
                }}
              >
                Register
              </Button>
            </>
          ) : (
            <Button className="nav-btn" color="inherit" onClick={handleLogout}>
              Logout
            </Button>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}
