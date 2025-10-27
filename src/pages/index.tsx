// Minh Pham
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

export default function Dashboard() {
  return (
    <Box
      sx={{
        flexGrow: 1,
      }}
    >
      <Container maxWidth="xl" sx={{ mb: 4, mt: 6 }}>
        <Typography variant="h4" gutterBottom>
          Dashboard
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">Start Matching</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                From the lecture halls to lasting bonds.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/matching">
                Discover Your Match
              </Button>
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">Your Stats</Typography>
              <Typography variant="body2">Coming soon…</Typography>
            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
