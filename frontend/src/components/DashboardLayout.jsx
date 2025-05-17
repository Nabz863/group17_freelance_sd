import React, { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import "../styles/theme.css";

export default function DashboardLayout({
  role = "User",
  menuItems = [],
  contentMap = {},
}) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState(menuItems[0]);
  const { logout } = useAuth0();

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleSidebarBtnClick = (e, label) => {
    setActiveSection(label);

    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 0.8;
    const x =
      (e.touches ? e.touches[0].clientX : e.clientX) - rect.left - size / 2;
    const y =
      (e.touches ? e.touches[0].clientY : e.clientY) - rect.top - size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);

    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#0e0e0e]">
      <nav
        className={`dashboard-sidebar ${sidebarOpen ? "" : " hidden"}`}
        aria-label="Sidebar"
      >
        <h2>{role}</h2>
        {menuItems.map((label) => (
          <button
            key={label}
            className={`dashboard-sidebar-btn${
              activeSection === label ? " selected" : ""
            } text-center pt-2 pb-1`}
            type="button"
            onClick={(e) => handleSidebarBtnClick(e, label)}
            onTouchStart={(e) => handleSidebarBtnClick(e, label)}
          >
            {label}
          </button>
        ))}
        <button
          className="dashboard-sidebar-btn mt-6 w-full text-center px-4 pt-2 pb-1 border border-red-400 text-red-500 hover:bg-red-100 rounded"
          type="button"
          onClick={() => {
            logout({ returnTo: window.location.origin });
            navigate("/");
          }}
        >
          Logout
        </button>
      </nav>

      <div className="flex-1 overflow-hidden">
        <button
          className="dashboard-hamburger md:hidden fixed top-4 left-4 z-50"
          aria-label="Toggle navigation menu"
          onClick={toggleSidebar}
          type="button"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <div className="dashboard-content-container">
          <section className="dashboard-content animate-fadeInUp p-6">
            {contentMap[activeSection] || <p>No content found.</p>}
          </section>
        </div>
      </div>
    </div>
  );
}
