import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import ApplyJobSection from '../components/ApplyJobSection';
import ChatSection from '../components/ChatSection';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';

export default function FreelancerDashboard() {
  const { user } = useAuth0();
  const [setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user?.sub) return;
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, created_at')
        .eq('freelancer_id', user.sub)
        .order('created_at', { ascending: false });
      if (!error) {
        setProjects(data);
        if (data.length) setCurrentProjectId(data[0].id);
      }
    })();
  }, [user]);

  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth > 900);
  const [activeSection, setActiveSection] = useState('Account Settings');

  const toggleSidebar = () => setSidebarOpen(v => !v);
  const handleSectionClick = (e, label) => {
    setActiveSection(label);
    const btn = e.currentTarget;
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    const rect = btn.getBoundingClientRect();
    const size = Math.max(btn.offsetWidth, btn.offsetHeight) * 0.8;
    const x =
      (e.touches ? e.touches[0].clientX : e.clientX) -
      rect.left -
      size / 2;
    const y =
      (e.touches ? e.touches[0].clientY : e.clientY) -
      rect.top -
      size / 2;
    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 520);

    if (window.innerWidth < 900) setSidebarOpen(false);
  };

  const freelancerSections = [
    'Account Settings',
    'Clients',
    'Inbox',
    'Payments',
    'Documents',
    'Available Jobs',
  ];

  const sectionContent = {
    'Account Settings': (
      <>
        <h1>Account Settings</h1>
        <p>Edit your freelancer profile and more.</p>
      </>
    ),
    Clients: (
      <>
        <h1>Clients</h1>
        <p>View your past clients.</p>
      </>
    ),
    Inbox: currentProjectId ? (
      <ChatSection projectId={currentProjectId} />
    ) : (
      <p>Select a project to open its chat.</p>
    ),
    Payments: (
      <>
        <h1>Payments</h1>
        <p>See payment history and withdrawals.</p>
      </>
    ),
    Documents: (
      <>
        <h1>Documents</h1>
        <p>Manage your uploads.</p>
      </>
    ),
    'Available Jobs': <ApplyJobSection />,
  };

  return (
    <main className="flex h-screen w-full bg-[#0e0e0e] text-white font-main relative">
      <button
        className="dashboard-hamburger"
        aria-label="Toggle navigation menu"
        onClick={toggleSidebar}
        type="button"
      >
        <span />
        <span />
        <span />
      </button>

      <nav
        className={`dashboard-sidebar ${sidebarOpen ? '' : ' hidden'}`}
        aria-label="Sidebar"
      >
        <h2>Freelancers</h2>
        {freelancerSections.map(label => (
          <button
            key={label}
            className={`dashboard-sidebar-btn${
              activeSection === label ? ' selected' : ''
            }`}
            onClick={e => handleSectionClick(e, label)}
            onTouchStart={e => handleSectionClick(e, label)}
            type="button"
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