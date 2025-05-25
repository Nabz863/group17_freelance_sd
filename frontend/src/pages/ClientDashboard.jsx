import {useAuth0} from "@auth0/auth0-react";
import {useEffect, useState} from "react";
import {toast} from "react-toastify";
import ChatSectionWrapper from "../components/ChatSectionWrapper";
import ClientProfile from "../components/ClientProfile";
import DashboardLayout from "../components/DashboardLayout";
import ViewApplicationsSection from "../components/ViewApplicationsSection";
import ActiveProjects from "../components/ActiveProjects";
import PostJobForm from "./PostJobForm";
import supabase from "../utils/supabaseClient";
import {createContract} from "../services/contractAPI";

export default function ClientDashboard() {
  const {user, isLoading: authLoading, isAuthenticated} = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);

  useEffect(() => {
    if (!user?.sub) return;
    supabase
      .from("projects")
      .select("id")
      .eq("client_id", user.sub)
      .limit(1)
      .then(({data, error}) => {
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
    return <p className="mt-4 text-gray-400">Please log in to view your dashboard.</p>;
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
      <section className="p-4 text-white">
        <header className="text-2xl font-semibold mb-2">Freelancers</header>
        <p>View or manage freelancers you’ve worked with.</p>
      </section>
    ),

    Inbox: (
      <ChatSectionWrapper user={user} isClient={true} />
    ),

    Payments: (
      <section className="p-4 text-white">
        <header className="text-2xl font-semibold mb-2">Payments</header>
        <p>Review invoices and payment history.</p>
      </section>
    ),

    Projects: <ActiveProjects isClient={true} />,

    "Post a Job": <PostJobForm embed={false} />,

    Applications: currentProjectId ? (
      <ViewApplicationsSection
        projectId={currentProjectId}
        onAssign={handleAssign}
      />
    ) : (
      <p className="p-4 text-gray-400">Loading applications…</p>
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