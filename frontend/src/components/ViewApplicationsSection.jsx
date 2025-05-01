import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import { useNavigate } from "react-router-dom";

export default function ViewApplicationsSection() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          description,
          client_id,
          freelancer_id,
          applications (
            freelancerid,
            status,
            freelancer:freelancerid (
              profile
            )
          )
        `)
        .eq("client_id", user?.sub);

      if (error) {
        console.error("Error loading job applications:", error);
      } else {
        setJobs(data);
      }

      setLoading(false);
    };

    if (user) fetchApplications();
  }, [user]);

  const toggleExpanded = (projectId) => {
    setExpanded((prev) => ({ ...prev, [projectId]: !prev[projectId] }));
  };

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>
      {loading ? (
        <p className="mt-4 text-gray-400">Loading applications...</p>
      ) : jobs.length === 0 ? (
        <p className="mt-4 text-gray-400">No jobs found.</p>
      ) : (
        jobs.map((job) => {
          const desc = typeof job.description === "string"
            ? JSON.parse(job.description || "{}")
            : job.description;

          return (
            <div
              key={job.id}
              className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg text-accent font-semibold">
                    {desc?.title || "Untitled Job"}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {desc?.details || "No job description provided."}
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => toggleExpanded(job.id)}
                >
                  {expanded[job.id] ? "Hide Applicants" : "View Applicants"}
                </button>
              </header>

              {expanded[job.id] && (
                <ul className="mt-4 space-y-4">
                  {job.applications.length === 0 ? (
                    <p className="text-gray-500 text-sm">No applicants yet.</p>
                  ) : (
                    job.applications.map((app) => {
                      let profile = app.freelancer?.profile;
                      if (typeof profile === "string") {
                        try {
                          profile = JSON.parse(profile);
                        } catch {
                          profile = {};
                        }
                      }

                      return (
                        <li
                          key={app.freelancerid}
                          className="p-3 rounded bg-[#222]"
                        >
                          <p className="text-white font-bold">
                            {profile?.firstName || "Unnamed"}{" "}
                            {profile?.lastName || ""}
                          </p>
                          <p className="text-sm text-gray-400">
                            {profile?.profession || "Unknown Profession"}
                          </p>
                          <p className="text-sm text-gray-400">
                            {profile?.email || "No email"}
                          </p>
                          <button
                            className="primary-btn mt-2"
                            onClick={() =>
                              navigate("/client/contracts", {
                                state: {
                                  projectId: job.id,
                                  freelancerId: app.freelancerid,
                                },
                              })
                            }
                          >
                            Draft Contract
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}