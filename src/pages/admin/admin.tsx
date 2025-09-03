import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function AdminDashboard() {
  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Admin Dashboard
          </Typography>

          <Stack spacing={2}>
            <TextField label="Search Users" fullWidth />

            <Stack direction="row" spacing={2}>
              <Button variant="contained" fullWidth>
                Manage Users
              </Button>
              <Button variant="outlined" fullWidth>
                Settings
              </Button>
            </Stack>

            <Button variant="text" color="error" fullWidth>
              Logout
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
