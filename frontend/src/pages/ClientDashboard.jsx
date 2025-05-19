import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { toast } from "react-toastify";
import ChatList from "../components/ChatList";
import ChatSection from "../components/ChatSection";
import ClientProfile from "../components/ClientProfile";
import DashboardLayout from "../components/DashboardLayout";
import ViewApplicationsSection from "../components/ViewApplicationsSection";
import ActiveProjects from "../components/ActiveProjects";
import PostJobForm from "./PostJobForm";
import supabase from "../utils/supabaseClient";
import { createContract } from "../services/contractAPI";

export default function ClientDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [activeChat, setActiveChat] = useState(null);

  // load one project id for Applications tab
  useState(() => {
    if (!user?.sub) return;
    supabase
      .from("projects")
      .select("id")
      .eq("client_id", user.sub)
      .limit(1)
      .then(({ data, error }) => {
        if (!error && data.length) {
          setCurrentProjectId(data[0].id);
        }
      });
  }, [user?.sub]);

  const handleAssign = async (freelancerId) => {
    try {
      await createContract({
        projectId: currentProjectId,
        title: `Contract for project ${currentProjectId}`,
        freelancerId,
      });
      toast.success("Contract created – freelancer notified");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create contract");
    }
  };

  if (authLoading) {
    return <p className="mt-4 text-gray-400">Loading auth…</p>;
  }
  if (!isAuthenticated) {
    return (
      <p className="mt-4 text-gray-400">
        Please log in to view your dashboard.
      </p>
    );
  }

  const menuItems = [
    "My Profile",
    "Freelancers",
    "Inbox",
    "Payments",
    "Projects",
    "Post a Job",
    "Applications",
  ];

  const contentMap = {
    "My Profile": <ClientProfile />,

    Freelancers: (
      <>
        <h1>Freelancers</h1>
        <p>View or manage freelancers you’ve worked with.</p>
      </>
    ),

    Inbox: (
      <section className="flex h-full">
        {/* pass userId and isClient=true */}
        <ChatList userId={user.sub} isClient={true} onSelect={setActiveChat} />
        <section className="flex-1 p-4">
          {activeChat ? (
            <ChatSection projectId={activeChat} currentUserId={user.sub} />
          ) : (
            <p className="text-gray-500">Select a chat to begin messaging.</p>
          )}
        </section>
      </section>
    ),

    Payments: (
      <>
        <h1>Payments</h1>
        <p>Review invoices and payment history.</p>
      </>
    ),

    // show all active projects + milestones/deliverables + approval UI
    Projects: <ActiveProjects isClient={true} />,

    "Post a Job": <PostJobForm embed={false} />,

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
      role="Client"
      menuItems={menuItems}
      contentMap={contentMap}
    />
  );
}
