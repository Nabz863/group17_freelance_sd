import React, { useState } from "react";
import "../styles/theme.css";

export default function DashboardLayout({ role = "User", menuItems = [], contentMap = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(menuItems[0]);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="flex bg-[#0e0e0e] text-white font-sans min-h-screen">
      {/* Sidebar */}
      <nav
        className={
          "dashboard-sidebar fixed md:relative z-40 transition-transform duration-300 ease-in-out" +
          (sidebarOpen ? " translate-x-0" : " -translate-x-full")
        }
      >
        <h2>{role}</h2>
        {menuItems.map((label) => (
          <button
            key={label}
            className={
              "dashboard-sidebar-btn" + (activeSection === label ? " selected" : "")
            }
            type="button"
            onClick={(e) => {
              setActiveSection(label);

              const btn = e.currentTarget;
              const ripple = document.createElement("span");
              ripple.className = "ripple";
              const rect = btn.getBoundingClientRect();
              const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 0.8;
              const x = e.clientX - rect.left - size / 2;
              const y = e.clientY - rect.top - size / 2;
              ripple.style.width = ripple.style.height = `${size}px`;
              ripple.style.left = `${x}px`;
              ripple.style.top = `${y}px`;
              btn.appendChild(ripple);
              setTimeout(() => ripple.remove(), 520);

              if (window.innerWidth < 900) setSidebarOpen(false);
            }}
            onTouchStart={(e) => {
              setActiveSection(label);
              if (window.innerWidth < 900) setSidebarOpen(false);
            }}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <div className="flex-1 md:ml-[250px] w-full min-h-screen">
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

        <section className="dashboard-content animate-fadeInUp">
          {contentMap[activeSection] || <p>No content found.</p>}
        </section>
      </div>
    </div>
  );
}

