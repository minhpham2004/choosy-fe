import {
  Box,
  Button,
  Container,
  Link,
  styled,
  type Theme,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { ArrowForward } from "@mui/icons-material";

export const CustomBackground = styled(Box)(({ theme }) => ({
  alignItems: "center",
  background:
    theme.palette.mode === "dark"
      ? `linear-gradient(45deg, #7f699b, #9232ff, #000000, #000000, #ffb800)`
      : `linear-gradient(45deg, #7f699b, #9232ff, #000000, #000000, #ffb800)`,
  backgroundSize: "600% 100%",
  animation: "gradient linear 16s infinite alternate",
  display: "flex",
  justifyContent: "center",
}));

const LoginPage = () => {
  const mdUp = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));

  return (
    <>
      <CustomBackground
        sx={{
          alignItems: "center",
          display: "flex",
          flexGrow: 1,
          py: "80px",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 6,
            }}
          >
            <Box
              alt="Not found"
              component="img"
              src={`/react.svg`}
              sx={{
                height: "auto",
                maxWidth: "100%",
                width: 400,
              }}
            />
          </Box>
          <Typography align="center" variant={mdUp ? "h1" : "h4"}>
            401: Authorization required
          </Typography>
          <Typography align="center" color="text.secondary" sx={{ mt: 0.5 }}>
            You've logged out or your session has expired. Please log in again.
          </Typography>
          <Link
            href="/auth/login"
            sx={{
              display: "flex",
              justifyContent: "center",
              mt: 6,
            }}
          >
            <Button variant="contained" endIcon={<ArrowForward />}>
              Login Now
            </Button>
          </Link>
        </Container>
      </CustomBackground>
    </>
  );
};

export default LoginPage;
