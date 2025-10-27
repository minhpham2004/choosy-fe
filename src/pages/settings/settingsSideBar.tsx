// Nathan Ravasini
import { NavLink } from "react-router-dom";
import { Card, CardContent, Stack, Typography, Button } from "@mui/material";

export default function SettingsSidebar() {
  return (
    <Card sx={{ minWidth: 260, height: "fit-content" }}>
      <CardContent>
        <Typography variant="overline">Settings</Typography>
        <Stack mt={1} gap={1}>
          <NavItem to="/settings/profile" label="Profile" />
          <NavItem to="/settings/account" label="Account & Security" />
        </Stack>
      </CardContent>
    </Card>
  );
}

function NavItem({ to, label }: { to: string; label: string }) {
  return (
    <NavLink to={to} end style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Button
          disableElevation
          fullWidth
          variant={isActive ? "contained" : "text"}
          sx={{ justifyContent: "flex-start" }}
        >
          {label}
        </Button>
      )}
    </NavLink>
  );
}
