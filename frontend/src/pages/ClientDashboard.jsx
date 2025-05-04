import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import supabase from '../utils/supabaseClient';

export default function ClientDashboard() {
  const { getAccessTokenSilently } = useAuth0();
  const [setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  useEffect(() => {
    const loadProjects = async () => {
      const userId = user.sub;
      const { data, error } = await supabase
        .from('projects')
        .select('id, title, …')
        .eq('client_id', userId);

      if (!error && data.length > 0) {
        setProjects(data);
        setCurrentProjectId(data[0].id);
      }
    };
    loadProjects();
  }, []);

  const handleAssign = async (freelancerId) => {
    try {
      const token = await getAccessTokenSilently();
      await axios.post(
        '/api/contracts',
        {
          projectId: currentProjectId,
          freelancerId,
          title: `Contract for project ${currentProjectId}`,
          contractSections: [],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
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