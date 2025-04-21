import { useState } from "react";
import PostJobForm from "./PostJobForm";
import "../styles/theme.css";

const clientSections = [
  "Account Settings",
  "Freelancers",
  "Inbox",
  "Payments",
  "Projects",
  "Post a Job"
];

const staticContent = {
  "Account Settings": (
    <>
      <h1>Account Settings</h1>
      <p>Edit profile, password and more.</p>
    </>
  ),
  "Freelancers": (
    <>
      <h1>Freelancers</h1>
      <p>View or manage freelancers you've worked with.</p>
    </>
  ),
  "Inbox": (
    <>
      <h1>Inbox</h1>
      <p>Your messages with freelancers.</p>
    </>
  ),
  "Payments": (
    <>
      <h1>Payments</h1>
      <p>Review invoices and payment history.</p>
    </>
  ),
  "Projects": (
    <>
      <h1>Projects</h1>
      <p>See current and past projects with freelancers.</p>
    </>
  )
};

export default function ClientDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [activeSection, setActiveSection] = useState(clientSections[0]);

  const toggleSidebar = () => setSidebarOpen((v) => !v);

  const handleSidebarBtnClick = (e, label) => {
    setActiveSection(label);
    const btn = e.currentTarget;
    const ripple = document.createElement("span");
    ripple.className = "ripple";
    const rect = btn.getBoundingClientRect();
    const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 0.8;
    let x, y;
    if (e.touches) {
      x = e.touches[0].clientX - rect.left - size / 2;
      y = e.touches[0].clientY - rect.top - size / 2;
    } else {
      x = e.clientX - rect.left - size / 2;
      y = e.clientY - rect.top - size / 2;
    }
    ripple.style.width = ripple.style.height = size + "px";
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => { if (ripple.parentNode) ripple.remove(); }, 520);

    if (window.innerWidth < 900) setSidebarOpen(false);
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

      <nav
        className={"dashboard-sidebar" + (sidebarOpen ? "" : " hidden")}
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

      <section className="dashboard-content animate-fadeInUp">
        {activeSection === "Post a Job"
          ? <PostJobForm embed />
          : staticContent[activeSection] || <p>No content found.</p>}
      </section>
    </main>
  );
}
