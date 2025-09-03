import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/login";
import Register from "./pages/auth/register";
import Dashboard from "./pages/index.tsx";
import Navbar from "./layouts/navbar";

function App() {
  return (
    <BrowserRouter>
      <div className="navbar">
        <Navbar />
      </div>
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile-creation" element={<ProfileCreation />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
