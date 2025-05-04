import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';

import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';

import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  const { user } = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    async function loadProjects() {
      if (!user?.sub) return;
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user.sub);
      if (!error && data?.length) {
        setCurrentProjectId(data[0].id);
      }
    }
    loadProjects();
  }, [user]);

  const handleAssign = async (freelancerId) => {
    const res = await fetch('/api/contracts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        projectId:        currentProjectId,
        title:            `Contract for project ${currentProjectId}`,
        freelancerId,
        contractSections: []
      }),
    });
    if (res.ok) {
      toast.success('Contract created and sent for review');
    } else {
      const err = await res.json().catch(() => null);
      toast.error('Failed to create contract: ' + (err?.message || res.statusText));
    }
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
    'Post a Job': <PostJobForm embed={false} />,
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