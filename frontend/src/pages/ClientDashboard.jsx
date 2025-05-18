// src/pages/ClientDashboard.jsx
import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ChatList from "../components/ChatList";
import ChatSection from "../components/ChatSection";
import ClientProfile from "../components/ClientProfile";
import DashboardLayout from "../components/DashboardLayout";
import ViewApplicationsSection from "../components/ViewApplicationsSection";
import { createContract } from "../services/contractAPI";
import supabase from "../utils/supabaseClient";
import PostJobForm from "./PostJobForm";

export default function ClientDashboard() {
  const { user, isLoading: authLoading, isAuthenticated } = useAuth0();
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [projects] = useState([]);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    if (!user?.sub) return;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("id")
        .eq("client_id", user.sub)
        .limit(1);
      if (!error && data.length) {
        setCurrentProjectId(data[0].id);
      }
    })();
  }, [user]);

  //listing projects for projects tab

  useEffect(() => {
    if (!user?.sub) return;
    (async () => {
      const { data, error } = await supabase
        .from("projects")
        .select("*, milestones(*)")
        .eq("client_id", user.sub);
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
        freelancerId,
      });
      toast.success("Contract created – freelancer notified");
    } catch (err) {
      console.error(err);
      toast.error("Failed to create contract");
    }
  };

  // Early returns for loading/auth
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

  function ProjectsList({ projects }) {
    if (!projects.length) return <p>No projects posted yet.</p>;

    return (
      <section aria-labelledby="projects-heading">
        <h2 id="projects-heading" className="projectsHeading">
          Your Projects
        </h2>
        <ul className="projectList">
          {projects.map((project) => {
            const desc = JSON.parse(project.description);
            return (
              <li key={project.id} className="projectList">
                <article>
                  <h3>{desc.title}</h3>
                  {project.milestones?.length ? (
                    <ul>
                      {project.milestones.map((m) => (
                        <li key={m.id} className="projectMilestones">
                          {m.title}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p>No milestones yet.</p>
                  )}
                </article>
              </li>
            );
          })}
        </ul>
      </section>
    );
  }

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
        <ChatList onSelect={setActiveChat} />
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
    Projects: <ProjectsList projects={projects} />,

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
