import React, { useState, useEffect } from "react";
import supabase from "../utils/supabaseClient";
import { useAuth0 } from "@auth0/auth0-react";
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
  const userId = user?.sub;
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [activeSection, setActiveSection] = useState(freelancerSections[0]);
  const [projects, setProjects] = useState([]);

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

  const fetchProjects = async () => {
    const { data, error } = await supabase.from("projects").select("*").eq("completed", false);
    if (!error) setProjects(data);
    else console.error("Failed to fetch projects", error);
  };

  const applyToProject = async (projectId) => {
    const userId = user?.sub;
    if (!userId) return;
  
    const application = {
      applicationID: `${userId}_${projectId}`,
      freelancerID: userId,
      projectID: projectId,
      status: "pending",
    };
  
    const { error } = await supabase.from("applications").insert(application);
    if (error) console.error("Application failed:", error);
    else alert("Applied successfully!");
  };

  useEffect(() => {
    if (activeSection === "Available Jobs") fetchProjects();
  }, [activeSection]);

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
    "Available Jobs": (
      <>
        <h1>Available Jobs</h1>
        {projects.length === 0 ? (
          <p className="text-gray-400 mt-4">No jobs available at the moment.</p>
        ) : (
          <div className="grid gap-4 mt-6">
            {projects.map((job) => (
              <div key={job.id} className="card-glow p-5 bg-[#1a1a1a] rounded-lg">
                <h2 className="text-lg font-bold text-accent">{job.description?.title}</h2>
                <p className="text-sm text-gray-300 mt-1">{job.description?.details}</p>
                <p className="text-sm mt-2"><strong>Requirements:</strong> {job.description?.requirements}</p>
                <p className="text-sm"><strong>Budget:</strong> R{job.description?.budget}</p>
                <p className="text-sm"><strong>Deadline:</strong> {job.description?.deadline}</p>
                <button
                  className="primary-btn mt-4"
                  onClick={() => applyToProject(job.id)}
                >
                  Apply
                </button>
              </div>
            ))}
          </div>
        )}
      </>
    ),
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
