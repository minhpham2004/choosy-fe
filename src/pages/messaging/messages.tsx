import {
  Box,
  Card,
  CardContent,
  Typography,
  
  Stack,
  Container,
} from "@mui/material";


export default function Messages() {
  return (
    <Box
      sx={{ flexGrow: 1 }}
    >
      <Container maxWidth="xl" sx={{ mb: 4, mt: 6 }}>
        
        <Typography variant="h4" gutterBottom>
          Messages
        </Typography>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5}}>
                Matches
              </Typography>
              <Typography variant="body2">
                This is where you'll find your matches.
              </Typography>
              
            </CardContent>
          </Card>

          <Card sx={{ flex: 1 }}>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 5}}>
                Match Name
              </Typography>

              <Typography variant="body2">
                This is where your messaging will be…
              </Typography>

            </CardContent>
          </Card>
        </Stack>
      </Container>
    </Box>
  );
}
