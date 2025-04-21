import React, { useState } from "react";
import "../styles/theme.css";

export default function DashboardLayout({ role = "User", menuItems = [], contentMap = {} }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(menuItems[0]);

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

    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  return (
    <main className="flex min-h-screen text-white font-main relative bg-[#0e0e0e]">
      {/* Sidebar */}
      <nav
        className={`dashboard-sidebar ${sidebarOpen ? "" : " hidden"}`}
        aria-label="Sidebar"
      >
        <h2>{role}</h2>
        {menuItems.map((label) => (
          <button
            key={label}
            className={`dashboard-sidebar-btn${activeSection === label ? " selected" : ""}`}
            type="button"
            onClick={(e) => handleSidebarBtnClick(e, label)}
            onTouchStart={(e) => handleSidebarBtnClick(e, label)}
          >
            {label}
          </button>
        ))}
      </nav>

      {/* Hamburger */}
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

      {/* Main Content */}
      <section className="dashboard-content animate-fadeInUp">
        {contentMap[activeSection] || <p>No content found.</p>}
      </section>
    </main>
  );
}

