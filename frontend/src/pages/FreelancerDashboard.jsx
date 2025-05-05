// src/pages/FreelancerDashboard.jsx
import React, { useState } from 'react';
import { useAuth0 }               from '@auth0/auth0-react';
import DashboardLayout            from '../components/DashboardLayout';
import ApplyJobSection            from '../components/ApplyJobSection';
import ChatList                   from '../components/ChatList';
import ChatSection                from '../components/ChatSection';

export default function FreelancerDashboard() {
  const [activeChat, setActiveChat] = useState(null);

  const menuItems = [
    'Account Settings',
    'Clients',
    'Inbox',            // ← here’s our single messaging entry
    'Payments',
    'Documents',
    'Available Jobs'
  ];

  // This maps the active sidebar label to its content
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
        <ChatList onSelect={setActiveChat} />
        <div className="flex-1 p-4">
          {activeChat
            ? <ChatSection projectId={activeChat} />
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
      role="Freelancers"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}