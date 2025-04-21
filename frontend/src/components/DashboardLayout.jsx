import React, { useState } from "react";
import "../styles/theme.css";

export default function DashboardLayout({ role = "User", menuItems = [], contentMap = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(menuItems[0]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex h-screen w-full bg-[#0e0e0e] text-white font-main">
      {/* Sidebar */}
      <nav
        className={
          "dashboard-sidebar" + (sidebarOpen ? "" : " hidden")
        }
        aria-label="Sidebar"
      >
        <h2>Clients</h2>
        {clientSections.map((label) => (
          <button
            key={label}
            className={
              "dashboard-sidebar-btn" +
              (activeSection === label ? " selected" : "")
            }
            type="button"
            onClick={(e) => handleSidebarBtnClick(e, label)}
            onTouchStart={(e) => handleSidebarBtnClick(e, label)}
          >
            {label}
          </button>
        ))}
      </nav>
  
      {/* Content area */}
      <div className="flex-1 flex flex-col relative overflow-y-auto">
        {/* Mobile hamburger */}
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
  
        {/* Main content */}
        <section className="dashboard-content animate-fadeInUp">
          {activeSection === "Post a Job"
            ? <PostJobForm embed />
            : staticContent[activeSection] || <p>No content found.</p>}
        </section>
      </div>
    </div>
  );
}

