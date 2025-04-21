import React from "react";
import DashboardLayout from "./components/DashboardLayout";
import "./styles/theme.css";

function OverviewSection() {
  return (
    <section className="card-glow bg-[#1a1a1a] p-6 rounded-xl animate-fadeInUp">
      <h2 className="text-xl text-accent font-semibold mb-2">Welcome to the Client Dashboard</h2>
      <p className="text-gray-300">
        Manage your freelancers, projects, and payments all in one place.
      </p>
    </section>
  );
}

function PostJobSection() {
  return (
    <section className="card-glow bg-[#1a1a1a] p-6 rounded-xl animate-fadeInUp">
      <h2 className="text-xl text-accent font-semibold mb-2">Post a New Job</h2>
      <p className="text-gray-300">Quickly publish a job with your requirements and budget.</p>
    </section>
  );
}

function ProjectsSection() {
  return (
    <section className="card-glow bg-[#1a1a1a] p-6 rounded-xl animate-fadeInUp">
      <h2 className="text-xl text-accent font-semibold mb-2">My Projects</h2>
      <p className="text-gray-300">Review your current and past projects.</p>
    </section>
  );
}

function InboxSection() {
  return (
    <section className="card-glow bg-[#1a1a1a] p-6 rounded-xl animate-fadeInUp">
      <h2 className="text-xl text-accent font-semibold mb-2">Inbox</h2>
      <p className="text-gray-300">Messages and updates from freelancers.</p>
    </section>
  );
}

function PaymentsSection() {
  return (
    <section className="card-glow bg-[#1a1a1a] p-6 rounded-xl animate-fadeInUp">
      <h2 className="text-xl text-accent font-semibold mb-2">Payments</h2>
      <p className="text-gray-300">Manage and track your transactions securely.</p>
    </section>
  );
}

function FreelancersSection() {
  return (
    <section className="card-glow bg-[#1a1a1a] p-6 rounded-xl animate-fadeInUp">
      <h2 className="text-xl text-accent font-semibold mb-2">Freelancers</h2>
      <p className="text-gray-300">Search, view, and connect with freelancers.</p>
    </section>
  );
}

export default function ClientDashboard() {
  const menuItems = [
    "Overview",
    "Post a Job",
    "Projects",
    "Inbox",
    "Payments",
    "Freelancers"
  ];

  const contentMap = {
    Overview: <OverviewSection />,
    "Post a Job": <PostJobSection />,
    Projects: <ProjectsSection />,
    Inbox: <InboxSection />,
    Payments: <PaymentsSection />,
    Freelancers: <FreelancersSection />
  };

  return <DashboardLayout role="Client" menuItems={menuItems} contentMap={contentMap} />;
}