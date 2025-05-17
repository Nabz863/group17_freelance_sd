import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import UserApprovalPanel from "../components/UserApprovalPanel";

export default function AdminDashboard() {
  const menuItems = [
    "Requests",
    "Freelancers",
    "Clients",
    "Projects",
    "Payments",
    "Reports",
    "Account Settings",
  ];

  const contentMap = {
    Requests: (
      <>
        <h1>Admin: Pending Profile Approvals</h1>
        <h2>User Approval Requests</h2>
        <p>Review and approve pending client and freelancer profiles</p>
        <UserApprovalPanel />
      </>
    ),
  };

  return (
    <DashboardLayout
      role="Admin"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}