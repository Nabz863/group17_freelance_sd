import React from "react";
import { Routes, Route, useNavigate, useParams, useLocation } from "react-router-dom";

import Landing from "./pages/Landing";
import PendingApproval from "./pages/PendingApproval";
import AdminDashboard from "./pages/AdminDashboard";
import ClientDashboard from "./pages/ClientDashboard";
import FreelancerDashboard from "./pages/FreelancerDashboard";
import ClientContracts from "./pages/ClientContracts";
import FreelancerContracts from "./pages/FreelancerContracts";
import Unauthorised from "./pages/Unauthorised";
import RegisterRole from "./pages/RegisterRole";
import FreelancerProfileForm from "./pages/FreelancerProfileForm";
import ClientProfileForm from "./pages/ClientProfileForm";
import CreateProfile from "./pages/CreateProfile";
import VerifyEmail from "./pages/VerifyEmail";

function PDFViewer() {
  const { userId } = useParams();
  const location = useLocation();
  const type = new URLSearchParams(location.search).get("type");
  window.location.href = `/api/users/${userId}/profile/pdf?type=${type}`;
  return null;
}

export default function RoutesComponent() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/pending"      element={<PendingApproval />} />
      <Route path="/unauthorized" element={<Unauthorised />} />

      <Route path="/register-role"             element={<RegisterRole />} />
      <Route path="/create-freelancer-profile" element={<FreelancerProfileForm />} />
      <Route path="/create-client-profile"     element={<ClientProfileForm />} />
      <Route path="/create-profile"            element={<CreateProfile />} />

      <Route path="/admin"      element={<AdminDashboard />} />
      <Route path="/client"     element={<ClientDashboard />} />
      <Route path="/freelancer" element={<FreelancerDashboard />} />

      <Route path="/client/contracts"     element={<ClientContracts />} />
      <Route path="/freelancer/contracts" element={<FreelancerContracts />} />

      <Route
        path="/admin/users/:userId/profile/pdf"
        element={<PDFViewer />}
      />

      <Route
        path="*"
        element={
          <label className="p-8 text-center text-white">
            404 – Not Found
          </label>
        }
      />
    </Routes>
  );
}