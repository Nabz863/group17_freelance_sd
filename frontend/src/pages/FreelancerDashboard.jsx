import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import FreelancerProfile from "../components/FreelancerProfile";
import ChatSectionWrapper from "../components/ChatSectionWrapper";
import ActiveProjects from "../components/ActiveProjects";
import ApplyJobSection from "../components/ApplyJobSection";

export default function FreelancerDashboard() {
  const {user, isLoading: authLoading, isAuthenticated} = useAuth0();
  const navigate = useNavigate();

  if (authLoading) {
    return <p className="mt-4 text-gray-400">Loading auth…</p>;
  }

  if (!isAuthenticated) {
    return <p className="mt-4 text-gray-400">Please log in to view your dashboard.</p>;
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
    "My Profile": (
      <section className="p-6">
        <FreelancerProfile />
      </section>
    ),

    Clients: (
      <section className="p-4 text-white">
        <header className="text-2xl font-semibold mb-2">Clients</header>
        <p>View clients and manage communications.</p>
      </section>
    ),

    Inbox: (
      <ChatSectionWrapper user={user} isClient={false} />
    ),

    Payments: (
      <section className="p-4 text-white">
        <header className="text-2xl font-semibold mb-2">Payments</header>
        <p>See payment history and withdrawals.</p>
      </section>
    ),

    Projects: (
      <section className="p-4">
        <h2 className="text-2xl font-semibold mb-4">Your Active Projects</h2>
        <ActiveProjects isClient={false} />
      </section>
    ),

    "Available Jobs": <ApplyJobSection />,

    "Report Issue": (
      <section className="p-4">
        <button
          type="button"
          onClick={handleReportIssue}
          className="text-blue-600 underline"
        >
          Go to Report Issue Page
        </button>
      </section>
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