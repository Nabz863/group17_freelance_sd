// src/pages/ClientDashboard.jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  // When a freelancer is chosen, insert a contract
  const handleAssign = async (projectId, freelancerId) => {
    try {
      const user = supabase.auth.user();
      if (!user?.id) throw new Error('No authenticated client');
      const { error } = await supabase.from('contracts').insert({
        project_id: projectId,
        client_id: user.id,
        freelancer_id: freelancerId,
        title: `Contract for project ${projectId}`,
        status: 'pending',
        // contract_sections can be set here if you have them
      });
      if (error) throw error;
      // TODO: generate PDF, send notifications…
      console.log('Created contract for', projectId, freelancerId);
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
    Applications: <ViewApplicationsSection onAssign={handleAssign} />,
  };

  return (
    <DashboardLayout
      role="Clients"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}