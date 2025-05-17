import axios from "axios";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../components/DashboardLayout";
import ViewApplicationsSection from "../components/ViewApplicationsSection";
import supabase from "../utils/supabaseClient";
import PostJobForm from "./PostJobForm";
import { useAuth0 } from '@auth0/auth0-react';
import ReportIssue from "../components/ReportIssue";
export default function ClientDashboard() {
  //const { user, getAccessTokenSilently } = useAuth0();   (changed for dev purposes.Uncomment b4 committing)
  const user = { sub: "mock-client-id", email: "mock@client.com" }; //remove b4 committing
  const [projects, setProjects] = useState([]);

  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [activeSection, setActiveSection] = useState("Account Settings");

  useEffect(() => {
    async function load() {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("client_id", user.sub);
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
      //const token = await getAccessTokenSilently();     (changed for dev purposes.Uncomment b4 committing)
      const { data: contract } = await axios.post(
        "/api/contracts",
        {
          projectId: currentProjectId,
          clientId: user.sub,
          freelancerId,
          title: `Contract for project ${currentProjectId}`,
          contractSections: [],
        }
        //{ headers: { Authorization: `Bearer ${token}` } }     (changed for dev purposes.Uncomment b4 committing)
      );
      await supabase
        .from("projects")
        .update({ freelancer_id: freelancerId })
        .eq("id", currentProjectId);

      toast.success("Contract sent to freelancer for review!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to assign freelancer/contract.");
    }
  };

  const menuItems = [
    "Account Settings",
    "Freelancers",
    "Inbox",
    "Payments",
    "Projects",
    "Post a Job",
    "Applications",
    "Issues"
  ];

  const handleIssueClose = () => {
    setActiveSection(menuItems[0]);
  };

  function ProjectsList({ projects }) {
    if (!projects.length) return <p>No projects posted yet.</p>;

    return (
      <div>
        <h2>Your Projects</h2>
        <ul>
          {projects.map((project) => (
            <li key={project.id}>
              <strong>{project.title}</strong>
              <p>{project.description}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  const contentMap = {
    "Account Settings": (
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
    Projects: <ProjectsList projects={projects} />,
    "Post a Job": <PostJobForm />,
    Applications: currentProjectId ? (
      <ViewApplicationsSection
        projectId={currentProjectId}
        onAssign={handleAssign}
      />
    ) : (
      <p>Loading applications…</p>
    ),
    Issues: (
      <>
        <h1>Issues</h1>
        <p>View and manage reported issues.</p>
        <ReportIssue onClose={handleIssueClose} />
      </>
    )
  };

  return (
    <DashboardLayout
      role="Clients"
      menuItems={menuItems}
      contentMap={contentMap}
      setActiveSection={setActiveSection}
    />
  );
}
