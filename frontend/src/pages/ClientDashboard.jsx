import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';

import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import supabase from '../utils/supabaseClient';
import { createContract } from '../services/contractAPI';

export default function ClientDashboard() {
  const { user } = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user?.sub) return;
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user.sub);
      if (!error && data.length) {
        setCurrentProjectId(data[0].id);
      }
    })();
  }, [user]);

  const handleAssign = async freelancerId => {
    try {
      await createContract({
        projectId: currentProjectId,
        title: `Contract for project ${currentProjectId}`,
        freelancerId
      });
      toast.success('Contract created – freelancer notified');
    } catch (err) {
      console.error(err);
      toast.error('Failed to create contract');
    }
  };

  const menuItems = [
    'Account Settings',
    'Freelancers',
    'Inbox',
    'Payments',
    'Projects',
    'Post a Job',
    'Applications'
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
    )
  };

  return (
    <DashboardLayout
      role="Clients"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}
