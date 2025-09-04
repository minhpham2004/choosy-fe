import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function loginTemp() {
  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Login
          </Typography>
          <Stack spacing={2}>
            <TextField label="Email" type="email" fullWidth />
            
            <TextField label="Password" type="password" fullWidth />

            <Button variant="contained" fullWidth>
              Sign in
            </Button>

            <Typography>
              Don't have an account? <a href="/register">Register Now.</a>
            </Typography>

          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
