import React from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./components/DashboardLayout";
import "./styles/theme.css";

export default function ClientDashboard() {
  const navigate = useNavigate();
  const menuItems = [
    "Account Settings",
    "Freelancers",
    "Inbox",
    "Payments",
    "Projects",
    "Post a Job"
  ];

  return (
    <DashboardLayout role="Client" menuItems={menuItems}>
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-accent animate-fadeInUp">Client Dashboard</h1>
        <p className="text-gray-400 mt-2">Manage your projects, freelancers, and payments in one place.</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <article
          className="card-glow p-6 rounded-xl bg-[#1a1a1a] animate-float cursor-pointer hover:bg-[#1f1f1f] transition"
          onClick={() => navigate("/post-job")}
        >
          <h2 className="text-xl text-accent font-semibold mb-2">Post a New Job</h2>
          <p className="text-gray-300">Quickly publish a job with your requirements and budget.</p>
        </article>

        <article
          className="card-glow p-6 rounded-xl bg-[#1a1a1a] animate-float cursor-pointer hover:bg-[#1f1f1f] transition"
          onClick={() => navigate("/review-applicants")}
        >
          <h2 className="text-xl text-accent font-semibold mb-2">Review Applicants</h2>
          <p className="text-gray-300">View freelancer applications and assign projects with ease.</p>
        </article>
      </section>
    </DashboardLayout>
  );
}

