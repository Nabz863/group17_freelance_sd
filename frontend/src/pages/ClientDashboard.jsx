import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import ChatSection from '../components/ChatSection';
import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  const { user } = useAuth0();
  const [setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    (async () => {
      if (!user?.sub) return;
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, created_at')
        .eq('client_id', user.sub)
        .order('created_at', { ascending: false });
      if (!error) {
        setProjects(data);
        if (data.length) setCurrentProjectId(data[0].id);
      }
    })();
  }, [user]);

  const handleAssign = async (freelancerId) => {
    const { error } = await supabase
      .from('projects')
      .update({ freelancer_id: freelancerId })
      .eq('id', currentProjectId);
    if (error) console.error('Error assigning freelancer:', error);
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
    Inbox: currentProjectId ? (
      <ChatSection projectId={currentProjectId} />
    ) : (
      <p>Loading chats…</p>
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
    'Post a Job': <PostJobForm />,
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