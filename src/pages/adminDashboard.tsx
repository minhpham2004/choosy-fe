import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Stack,
  Container,
} from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function AdminDashboard() {
  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth="xl" sx={{ mb: 4, mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Admin Dashboard
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">
                View Users
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                You will be able to view registered user accounts here...
              </Typography>
              <Button variant="contained" component={RouterLink} to="/admin">
                Users
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">
                Statistics
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                You will be able to view site stats here?...
              </Typography>
              <Button variant="contained" component={RouterLink} to="/admin">
                Statistics
              </Button>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
