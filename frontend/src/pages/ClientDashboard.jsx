import React from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  const { user: auth0User } = useAuth0();
  const clientId = auth0User?.sub;

  const handleAssign = async (projectId, freelancerId) => {
    if (!clientId) {
      console.error('No client ID');
      return;
    }
    try {
      const { error } = await supabase
        .from('contracts')
        .insert({
          project_id: projectId,
          client_id: clientId,
          freelancer_id: freelancerId,
          title: `Contract for project ${projectId}`,
          status: 'pending',
        });
      if (error) throw error;
      console.log('Contract created for', projectId, freelancerId);
      // TODO: trigger PDF generation & notifications…
    } catch (err) {
      console.error('Error creating contract:', err);
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
    'Post a Job': <PostJobForm embed />,
    Applications: (
      <ViewApplicationsSection
        clientId={clientId}
        onAssign={handleAssign}
      />
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