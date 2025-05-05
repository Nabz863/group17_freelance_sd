import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

import DashboardLayout from '../components/DashboardLayout';
import ApplyJobSection from '../components/ApplyJobSection';
import ChatList from '../components/ChatList';
import ChatSection from '../components/ChatSection';
import supabase from '../utils/supabaseClient';

export default function FreelancerDashboard() {
  const { user } = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const menuItems = [
    'Account Settings',
    'Clients',
    'Inbox',
    'Payments',
    'Documents',
    'Available Jobs',
    'Chat',
  ];

  useEffect(() => {
    (async () => {
      if (!user?.sub) return;
      const { data, error } = await supabase
        .from('projects')
        .select('id, description')
        .or(`client_id.eq.${user.sub},freelancer_id.eq.${user.sub}`);
      if (!error && data?.length) {
        setCurrentProjectId(data[0].id);
      }
    })();
  }, [user]);

  const contentMap = {
    'Account Settings': (
      <>
        <h1>Account Settings</h1>
        <p>Edit your freelancer profile and more.</p>
      </>
    ),
    Clients: (
      <>
        <h1>Clients</h1>
        <p>View clients and manage communications.</p>
      </>
    ),
    Inbox: (
      <>
        <h1>Inbox</h1>
        <p>Chat with clients or view messages.</p>
      </>
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
        <p>Manage project documents and uploads.</p>
      </>
    ),
    'Available Jobs': <ApplyJobSection />,
    Chat: (
      <div className="flex h-full">
        <ChatList onSelect={setCurrentProjectId} />
        <ChatSection projectId={currentProjectId} />
      </div>
    ),
  };

  return (
    <DashboardLayout
      role="Freelancers"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}