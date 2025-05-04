// src/pages/ClientDashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  const { user, isAuthenticated } = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    async function loadProjects() {
      const { data, error } = await supabase
        .from('projects')
        .select('id, title')
        .eq('client_id', user.sub);

      if (!error && data?.length) {
        setCurrentProjectId(data[0].id);
      }
    }

    loadProjects();
  }, [isAuthenticated, user]);

  const handleAssign = async (freelancerId) => {
    if (!currentProjectId) return;

    await supabase
      .from('contracts')
      .insert({
        project_id: currentProjectId,
        client_id: user.sub,
        freelancer_id: freelancerId,
        title: `Contract for project ${currentProjectId}`,
        status: 'pending',
        contract_sections: []
      });
  };

  const menuItems = [
    'Account Settings',
    'Freelancers',
    'Inbox',
    'Payments',
    'Projects',
    'Post a Job',
    'Applications',
  ];

  const contentMap = {
    'Account Settings': (
      <>
        <h1>Account Settings</h1>
        <p>Edit profile, password and more.</p>
      </>
    ),
    Freelancers: (
      <>
        <h1>Freelancers</h1>
        <p>View or manage freelancers you’ve worked with.</p>
      </>
    ),
    Inbox: (
      <>
        <h1>Inbox</h1>
        <p>Your messages with freelancers.</p>
      </>
    ),
    Payments: (
      <>
        <h1>Payments</h1>
        <p>Review invoices and payment history.</p>
      </>
    ),
    Projects: (
      <>
        <h1>Projects</h1>
        <p>See current and past projects with freelancers.</p>
      </>
    ),
    'Post a Job': <PostJobForm embed />,
    Applications: currentProjectId ? (
      <ViewApplicationsSection
        projectId={currentProjectId}
        onAssign={handleAssign}
      />
    ) : (
      <p>Loading applications…</p>
    ),
  };

  return (
    <DashboardLayout
      role="Clients"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}