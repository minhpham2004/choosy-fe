import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import Login from "./pages/auth/loginTemp.tsx";
import Register from "./pages/auth/register.tsx";
import Dashboard from "./pages/index.tsx";
import Navbar from "./layouts/navbar";
import Matching from "./pages/matching.tsx";
import Messages from "./pages/messages.tsx";
import AdminDashboard from "./pages/adminDashboard.tsx";

function App() {
  return (
    <BrowserRouter>
      <div className="navbar">
        <Navbar />
      </div>
      
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Dashboard />} />
        <Route path="/matching" element={<Matching />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/admin" element={<AdminDashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
