// src/pages/FreelancerDashboard.jsx

import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import DashboardLayout from '../components/DashboardLayout';
import ApplyJobSection from '../components/ApplyJobSection';
import ChatList from '../components/ChatList';
import ChatSection from '../components/ChatSection';

export default function FreelancerDashboard() {
  const { user, isLoading, isAuthenticated } = useAuth0();
  const [activeChat, setActiveChat] = useState(null);

  if (isLoading) {
    return <p className="mt-4 text-gray-400">Loading auth…</p>;
  }
  if (!isAuthenticated) {
    return <p className="mt-4 text-gray-400">Please log in to view your dashboard.</p>;
  }

  const menuItems = [
    'Account Settings',
    'Clients',
    'Inbox',
    'Payments',
    'Documents',
    'Available Jobs'
  ];
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
      <div className="flex h-full">
        <ChatList
          userId={user.sub}
          isClient={false}
          onSelect={setActiveChat}
        />
        <div className="flex-1 p-4">
          {activeChat
            ? <ChatSection projectId={activeChat} currentUserId={user.sub} />
            : <p className="text-gray-500">Select a chat to begin messaging.</p>}
        </div>
      </div>
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
    'Available Jobs': <ApplyJobSection />
  };

  return (
    <DashboardLayout
      role="Freelancer"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}
