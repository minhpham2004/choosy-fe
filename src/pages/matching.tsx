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

export default function Matching() {
  return (
    <Box
      sx={{ flexGrow: 1 }}
    >
      <Container maxWidth="xl" sx={{ mb: 4, mt: 6 }}>
        
        <Typography variant="h4" gutterBottom sx={{ mb: 8}}>
          Matching
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6">Start Matching</Typography>
              <Typography variant="body2" sx={{ mb: 5, mt: 25}}>
                From the lecture halls to lasting bonds.
              </Typography>
              <Button variant="contained" component={RouterLink} to="/" sx={{ mr: 2}}>
                Dislike
              </Button>
              <Button variant="contained" component={RouterLink} to="/" sx={{ ml: 2}}>
                Like
              </Button>
            </CardContent>
          </Card>

          
        </Stack>
      </Container>
    </Box>
  );
}
