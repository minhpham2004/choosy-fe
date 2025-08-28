import {
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function ProfileCreation() {
  return (
    <Box sx={{ p: 3, display: "grid", placeItems: "center" }}>
      <Card sx={{ width: 420, maxWidth: "90vw" }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            Create your profile
          </Typography>
          <Stack spacing={2}>
            <TextField label="Email" type="email" fullWidth />
            <TextField label="Name" fullWidth />
            <TextField label="Password" type="password" fullWidth />
            <Button variant="contained" fullWidth>
              Sign up
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}
