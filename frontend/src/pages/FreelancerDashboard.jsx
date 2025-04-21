import React from "react";
import DashboardLayout from "./components/DashboardLayout";
import "./styles/theme.css";

export default function FreelancerDashboard() {
  const menuItems = [
    "Account Settings",
    "Clients",
    "Inbox",
    "Payments",
    "Documents",
    "Apply for Jobs"
  ];

  return (
    <DashboardLayout role="Freelancer" menuItems={menuItems}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-accent animate-fadeInUp">Freelancer Dashboard</h1>
        <p className="text-gray-400 mt-2">View and apply to available projects, manage your payments and docs.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article className="card-glow p-6 rounded-xl bg-[#1a1a1a] animate-float">
          <h2 className="text-xl text-accent font-semibold mb-2">Available Projects</h2>
          <p className="text-gray-300">Browse and apply to client-posted gigs that match your skills.</p>
        </article>

        <article className="card-glow p-6 rounded-xl bg-[#1a1a1a] animate-float">
          <h2 className="text-xl text-accent font-semibold mb-2">Submitted Applications</h2>
          <p className="text-gray-300">Track application status and manage responses.</p>
        </article>
      </section>
    </DashboardLayout>
  );
}