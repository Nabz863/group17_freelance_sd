import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import FreelancerProfile from "../components/FreelancerProfile";
import ChatList from "../components/ChatList";
import ChatSection from "../components/ChatSection";
import ActiveProjects from "../components/ActiveProjects";
import ApplyJobSection from "../components/ApplyJobSection";

export default function FreelancerDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth0();
  const navigate = useNavigate();
  const [activeChat, setActiveChat] = useState(null);

  if (authLoading) {
    return <p className="mt-4 text-gray-400">Loading auth…</p>;
  }
  if (!isAuthenticated) {
    return (
      <p className="mt-4 text-gray-400">
        Please log in to view your dashboard.
      </p>
    );
  }

  const menuItems = [
    "My Profile",
    "Clients",
    "Inbox",
    "Payments",
    "Projects",
    "Available Jobs",
    "Report Issue",
  ];

  const handleReportIssue = () => {
    navigate("/report-issue");
  };

  const contentMap = {
    // 1) Profile editor/viewer
    "My Profile": (
      <div className="p-6">
        <FreelancerProfile />
      </div>
    ),

    // 2) Placeholder for Clients tab
    Clients: (
      <>
        <h1>Clients</h1>
        <p>View clients and manage communications.</p>
      </>
    ),

    // 3) Inbox (chat)
    Inbox: (
      <div className="flex h-full">
        <ChatList
          userId={user.sub}
          isClient={false}
          onSelect={setActiveChat}
        />
        <div className="flex-1 p-4">
          {activeChat ? (
            <ChatSection
              projectId={activeChat}
              currentUserId={user.sub}
            />
          ) : (
            <p className="text-gray-500">Select a chat to begin messaging.</p>
          )}
        </div>
      </div>
    ),

    // 4) Payments placeholder
    Payments: (
      <>
        <h1>Payments</h1>
        <p>See payment history and withdrawals.</p>
      </>
    ),

    // 5) Freelancer's own projects
    Projects: (
      <section className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Active Projects</h2>
        <ActiveProjects />
      </section>
    ),

    // 6) Available jobs to apply
    "Available Jobs": <ApplyJobSection />,

    // 7) Report Issue
    "Report Issue": (
      <button
        type="button"
        onClick={handleReportIssue}
        className="text-blue-600 underline"
      >
        Go to Report Issue Page
      </button>
    ),
  };

  return (
    <DashboardLayout
      role="Freelancer"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}
