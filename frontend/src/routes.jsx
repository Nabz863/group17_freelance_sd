import PendingApproval from "./pages/PendingApproval";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import Unauthorised from "./pages/Unauthorised";
import RegisterRole from "./pages/RegisterRole";
import Landing from "./pages/Landing";
import CreateProfile from "./pages/CreateProfile";
import VerifyEmail from "./pages/VerifyEmail";
import React from "react";
import { Routes, Route } from "react-router-dom";

export default function RoutesComponent() {
    return (
    <Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/pending" element={<PendingApproval />} />
    <Route path="/admin" element={<AdminDashboard />} />
    <Route path="/client" element={<ClientDashboard />} />
    <Route path="/freelancer" element={<FreelancerDashboard />} />
    <Route path="/unauthorized" element={<Unauthorised />} />
    <Route path="/register-role" element={<RegisterRole />} />
    <Route path="/create-profile" element={<CreateProfile />} />
    <Route path="/verify-email" element={<VerifyEmail />} />
    <Route path="*" element={<div className="p-8 text-center text-white">404 - Not Found</div>} />
  </Routes>
  );
}
