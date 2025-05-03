import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    async function loadFirstProject() {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .limit(1);

      if (!error && data?.length) {
        setCurrentProjectId(data[0].id);
      }
    }
    loadFirstProject();
  }, []);

  const handleAssign = async (freelancerId) => {
    if (!currentProjectId) return;
    const { error } = await supabase.from('contracts').insert({
      project_id: currentProjectId,
      freelancer_id: freelancerId,
      client_id: '',
      title: `Contract for project ${currentProjectId}`,
      status: 'pending'
    });
    if (error) console.error('Error creating contract:', error);
    // TODO: call your PDF‐generation / notification logic here
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
      <p className="text-gray-400">Loading applications…</p>
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