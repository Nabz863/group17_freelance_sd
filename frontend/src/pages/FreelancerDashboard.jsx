import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth0 } from "@auth0/auth0-react";
import ApplyJobSection from "../components/ApplyJobSection";
import "../styles/theme.css";

const freelancerSections = [
  "Account Settings",
  "Clients",
  "Inbox",
  "Payments",
  "Documents",
  "Available Jobs",
];

export default function FreelancerDashboard() {
  const { user } = useAuth0();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [activeSection, setActiveSection] = useState(freelancerSections[0]);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleSidebarBtnClick = (e, label) => {
    setActiveSection(label);
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 0.8;
    const x = (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - size / 2;
    const y = (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);
  };

  const sectionSelect = (e, label) => {
    handleSidebarBtnClick(e, label);
    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const sectionContent = {
    "Account Settings": (
      <>
        <h1>Account Settings</h1>
        <p>Edit your freelancer profile and more.</p>
      </>
    ),
    "Clients": (
      <>
        <h1>Clients</h1>
        <p>View clients and manage communications.</p>
      </>
    ),
    "Inbox": (
      <>
        <h1>Inbox</h1>
        <p>Chat with clients or view messages.</p>
      </>
    ),
    "Payments": (
      <>
        <h1>Payments</h1>
        <p>See payment history and withdrawals.</p>
      </>
    ),
    "Documents": (
      <>
        <h1>Documents</h1>
        <p>Manage project documents and uploads.</p>
      </>
    ),
    "Available Jobs": <ApplyJobSection />
  };

  return (
    <main className="flex h-screen w-full bg-[#0e0e0e] text-white font-main relative">
      <button
        className="dashboard-hamburger"
        aria-label="Toggle navigation menu"
        onClick={toggleSidebar}
        type="button"
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      <nav className={`dashboard-sidebar${sidebarOpen ? "" : " hidden"}`}>
        <h2>Freelancers</h2>
        {freelancerSections.map((label) => (
          <button
            key={label}
            className={`dashboard-sidebar-btn${activeSection === label ? " selected" : ""}`}
            type="button"
            onClick={(e) => sectionSelect(e, label)}
            onTouchStart={(e) => sectionSelect(e, label)}
          >
            {label}
          </button>
        ))}
      </nav>

      <section className="dashboard-content animate-fadeInUp">
        {sectionContent[activeSection]}
      </section>
    </main>
  );
}
