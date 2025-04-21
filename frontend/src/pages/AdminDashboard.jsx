import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import UserApprovalPanel from "../components/UserApprovalPanel";

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("Requests");

  const sections = {
    "Account Settings": (
      <>
        <h1>Account Settings</h1>
        <p>Update admin preferences and credentials.</p>
      </>
    ),
    "Requests": (
      <section>
        <h1>User Approval Requests</h1>
          <p>Review and approve pending client and freelancer profiles.</p>
        <UserApprovalPanel />
      </section>
),
    Freelancers: (
      <>
        <h1>Freelancers</h1>
        <p>Manage freelancer activity and profiles.</p>
      </>
    ),
    Clients: (
      <>
        <h1>Clients</h1>
        <p>Review client accounts and interactions.</p>
      </>
    ),
    Projects: (
      <>
        <h1>Projects</h1>
        <p>Monitor project assignments and progress.</p>
      </>
    ),
    Payments: (
      <>
        <h1>Payments</h1>
        <p>Issue or track payment records.</p>
      </>
    ),
    Reports: (
      <>
        <h1>Reports</h1>
        <p>Access platform usage reports and logs.</p>
      </>
    ),
  };

  return (
    <DashboardLayout
      role="Admin"
      menuItems={[
        "Account Settings",
        "Requests",
        "Freelancers",
        "Clients",
        "Projects",
        "Payments",
        "Reports",
      ]}
      activeSection={activeSection}
      setActiveSection={setActiveSection}
    >
      {sections[activeSection] || <p>No content for this section.</p>}
    </DashboardLayout>
  );
}
