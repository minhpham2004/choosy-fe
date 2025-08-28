import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'

export default function Navbar() {
  return (
    <AppBar position="static" elevation={1}>
      <Toolbar>
        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', pr: 5 }}>
          Choosy
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/matching">Matching</Button>
          <Button color="inherit" component={RouterLink} to="/login">Login</Button>
          <Button color="inherit" component={RouterLink} to="/register">Register</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
