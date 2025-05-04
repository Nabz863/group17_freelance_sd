import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import supabase from '../utils/supabaseClient';
import axios from 'axios';
import { toast } from 'react-toastify';

export default function ClientDashboard() {
  const { user, getAccessTokenSilently } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user.sub);
      if (!error && data.length) {
        setProjects(data);
        setCurrentProjectId(data[0].id);
      }
    }
    load();
  }, [user.sub]);

  const handleAssign = async (freelancerId) => {
    setCurrentProjectId((pid) => {
      if (!pid) return pid;
      return pid;
    });

    try {
      const token = await getAccessTokenSilently();
      const { data: contract } = await axios.post(
        '/api/contracts',
        {
          projectId: currentProjectId,
          clientId: user.sub,
          freelancerId,
          title: `Contract for project ${currentProjectId}`,
          contractSections: []
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      await supabase
        .from('projects')
        .update({ freelancer_id: freelancerId })
        .eq('id', currentProjectId);

      toast.success('Contract sent to freelancer for review!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to assign freelancer/contract.');
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
        <p>Edit your profile, password and more.</p>
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
    'Post a Job': <PostJobForm />,
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