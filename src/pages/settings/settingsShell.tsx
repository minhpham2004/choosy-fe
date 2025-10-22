import { Outlet } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import SettingsSidebar from "./settingsSideBar";

export default function SettingsShell() {
  return (
    <Stack direction={{ xs: "column", md: "row" }} gap={3} sx={{ p: { xs: 1, md: 2 } }}>
      <SettingsSidebar />
      <Box sx={{ flex: 1, minWidth: 0}}>
        <Outlet />
      </Box>
    </Stack>
  );
}
