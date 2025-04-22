import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";

export default function ViewApplicationsSection() {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [assigning, setAssigning] = useState({});

  useEffect(() => {
    const fetchClientProjectsWithApplicants = async () => {
      setLoading(true);
      setError(null);

      const { data: projectList, error: projectError } = await supabase
        .from("projects")
        .select("id, description, freelancer_id")
        .eq("client_id", user?.sub);

      if (projectError) {
        console.error("Project fetch error:", projectError);
        setError("Could not fetch projects.");
        setLoading(false);
        return;
      }

      const enrichedProjects = await Promise.all(
        projectList.map(async (proj) => {
          const { data: apps, error: appsError } = await supabase
            .from("applications")
            .select("freelancerID, status")
            .eq("projectID", proj.id);

          if (appsError) {
            console.error("Application fetch error:", appsError);
            return { ...proj, applicants: [] };
          }

          const profiles = await Promise.all(
            apps.map(async (app) => {
              const { data, error } = await supabase
                .from("freelancers")
                .select("user_id, profile")
                .eq("user_id", app.freelancerID)
                .maybeSingle();
              return {
                ...app,
                profile: data?.profile || null,
              };
            })
          );

          return { ...proj, applicants: profiles };
        })
      );

      setProjects(enrichedProjects);
      setLoading(false);
    };

    if (user) fetchClientProjectsWithApplicants();
  }, [user]);

  const handleAssign = async (projectId, freelancerId) => {
    setAssigning((prev) => ({ ...prev, [projectId]: freelancerId }));

    const { error } = await supabase
      .from("projects")
      .update({ freelancer_id: freelancerId })
      .eq("id", projectId);

    if (error) {
      console.error("Assignment error:", error);
      alert("Failed to assign freelancer.");
    } else {
      alert("Freelancer assigned successfully!");
    }

    setAssigning((prev) => ({ ...prev, [projectId]: null }));
  };

  return (
    <section className="dashboard-content">
      <h1 className="text-accent text-2xl mb-6">Your Job Postings</h1>
      {loading ? (
        <p>Loading applications...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : projects.length === 0 ? (
        <p>You have not posted any jobs.</p>
      ) : (
        <div className="space-y-6">
          {projects.map((proj) => (
            <article key={proj.id} className="bg-[#1a1a1a] p-5 rounded-lg card-glow">
              <h2 className="text-xl font-bold text-accent">{proj.description?.title || "Untitled Job"}</h2>
              <p className="text-sm text-gray-400 mb-3">{proj.description?.details}</p>

              <button
                onClick={() => setSelectedProject(selectedProject === proj.id ? null : proj.id)}
                className="primary-btn mb-4"
              >
                {selectedProject === proj.id ? "Hide Applicants" : "View Applicants"}
              </button>

              {selectedProject === proj.id && (
                <div className="space-y-4">
                  {proj.applicants.length === 0 ? (
                    <p className="text-gray-400">No applicants yet.</p>
                  ) : (
                    proj.applicants.map((app) => (
                      <div
                        key={app.freelancerID}
                        className="p-3 rounded border border-[#1abc9c] bg-[#151515]"
                      >
                        <p className="font-semibold text-white">
                          {app.profile?.firstName} {app.profile?.lastName}
                        </p>
                        <p className="text-gray-400 text-sm">{app.profile?.profession}</p>
                        <p className="text-gray-500 text-xs mb-2">{app.profile?.email}</p>

                        <button
                          className="primary-btn"
                          onClick={() => handleAssign(proj.id, app.freelancerID)}
                          disabled={assigning[proj.id] === app.freelancerID}
                        >
                          {assigning[proj.id] === app.freelancerID
                            ? "Assigning..."
                            : "Assign Freelancer"}
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
