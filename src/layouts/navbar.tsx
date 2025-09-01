import { AppBar, Box, Button, Toolbar, Typography } from '@mui/material'
import { Link as RouterLink } from 'react-router-dom'
import ChoosyLogo from "../assets/Choosy Icon.png"

export default function Navbar() {
  return (
    <AppBar 
      position="static" 
      elevation={1}
      sx={{ width: "100%", left: 0, right: 0 }}
      >

      <Toolbar>

        {/* Logo */}
        <Box
          component="img"
          src={ChoosyLogo}
          alt="Logo"
          sx={{ height: 40, mr: 1}}
        />

        <Typography variant="h5" sx={{ flexGrow: 1, fontWeight: 'bold', pr: 5 }}>
          Choosy
        </Typography>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button color="inherit" component={RouterLink} to="/">Dashboard</Button>
          <Button color="inherit" component={RouterLink} to="/matching">Matching</Button>
          <Button color="inherit" component={RouterLink} to="/messages">Messages</Button>
          <Button color="inherit" component={RouterLink} to="/login">Login</Button>
          <Button color="inherit" component={RouterLink} to="/register">Register</Button>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
