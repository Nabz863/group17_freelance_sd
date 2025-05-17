// src/pages/ClientDashboard.jsx

import {useState, useEffect} from 'react';
import {useAuth0} from '@auth0/auth0-react';
import {toast} from 'react-toastify';
import DashboardLayout from '../components/DashboardLayout';
import PostJobForm from './PostJobForm';
import ViewApplicationsSection from '../components/ViewApplicationsSection';
import ChatList from '../components/ChatList';
import ChatSection from '../components/ChatSection';
import supabase from '../utils/supabaseClient';
import {createContract} from '../services/contractAPI';

export default function ClientDashboard() {
  const {user, isLoading: authLoading, isAuthenticated} = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  //  Always call hooks at the top level
  useEffect(() => {
    if (!user?.sub) return;
    (async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('client_id', user.sub)
        .limit(1);
      if (!error && data.length) {
        setCurrentProjectId(data[0].id);
      }
    })();
  }, [user?.sub]);

  const handleAssign = async (freelancerId) => {
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

  // Early returns for loading/auth
  if (authLoading) {
    return <p className="mt-4 text-gray-400">Loading auth…</p>;
  }
  if (!isAuthenticated) {
    return <p className="mt-4 text-gray-400">Please log in to view your dashboard.</p>;
  }

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
      <div className="flex h-full">
        <ChatList
          userId={user.sub}
          isClient={true}
          onSelect={setActiveChat}
        />
        <div className="flex-1 p-4">
          {activeChat ? (
            <ChatSection projectId={activeChat} currentUserId={user.sub} />
          ) : (
            <p className="text-gray-500">Select a chat to begin messaging.</p>
          )}
        </div>
      </div>
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
      role="Client"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}