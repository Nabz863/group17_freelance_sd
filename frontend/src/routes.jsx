import PendingApproval from "./pages/PendingApproval";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import Unauthorised from "./pages/Unauthorised";
import RegisterRole from "./pages/RegisterRole";
import React from "react";
import { Routes, Route } from "react-router-dom";

export default function RoutesComponent() {
    return (
    <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/login" element={<Login />} />
    <Route path="/signup" element={<Signup />} />
    <Route path="/pending" element={<PendingApproval />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/client" element={<ClientDashboard />} />
    <Route path="/freelancer" element={<FreelancerDashboard />} />
    <Route path="/unauthorized" element={<Unauthorised />} />
    <Route path="/register-role" element={<RegisterRole />} />
    {/* fallback route */}
    <Route path="*" element={<Home />} />
    <Route path="/error" element={<div>Error during authentication.</div>} />
  </Routes>
  );
}
