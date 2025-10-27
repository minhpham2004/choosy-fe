import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/login.tsx";
import Register from "./pages/auth/register";
import Profile from "./pages/profile/profile.tsx";
import Dashboard from "./pages/index.tsx";
import Navbar from "./layouts/navbar.tsx";
import Admin from "./pages/admin/admin.tsx";
import Matching from "./pages/match/matching.tsx";
import Messages from "./pages/messaging/messages.tsx";
import Likes from "./pages/likes/likes.tsx";
import { useEffect } from "react";
import { setupAxiosInterceptors } from "./axios-interceptor.ts";
import { Toaster } from "react-hot-toast";
import AccountSettings from "./pages/settings/accountSettings.tsx";
import SettingsShell from "./pages/settings/settingsShell.tsx";
import { Navigate } from "react-router-dom";
import SessionsSettings from "./pages/settings/sessionsSettings.tsx";

function App() {
  useEffect(() => {
    setupAxiosInterceptors();
  }, []);

  return (
    <BrowserRouter>
      <div className="navbar">
        <Navbar />
      </div>

      <Routes>
        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Main */}
        
        <Route path="/admin" element={<Admin />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/likes" element={<Likes />} />
        <Route path="/messages" element={<Messages />} />

        {/* Profile & Account Settings */}
        <Route path="/settings" element={<SettingsShell />}>
          {/* Open profile first */}
          <Route index element={<Navigate to="profile" replace/>} />
            <Route path="profile" element={<Profile />} />
            <Route path="account" element={<AccountSettings />} />
            <Route path="sessions" element={<SessionsSettings />} />
        </Route>

        {/* Optional 404 Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster position="top-right" />
    </BrowserRouter>
  );
}

export default App;
