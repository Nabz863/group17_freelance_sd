import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";

export default function ViewApplicationsSection() {
  const { user } = useAuth0();
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [assigning, setAssigning] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("projects")
        .select(`
          id,
          description,
          freelancer_id,
          applications (
            freelancerid,
            status,
            freelancer:freelancerid (profile)
          )
        `)
        .eq("client_id", user?.sub);

      if (error) {
        console.error("Error loading job applications:", error);
      } else {
        setJobs(data || []);
      }

      setLoading(false);
    };

    if (user) fetchApplications();
  }, [user]);

  const handleAssign = async (projectId, freelancerid) => {
    setAssigning(projectId);
    const { error } = await supabase
      .from("projects")
      .update({ freelancer_id: freelancerid })
      .eq("id", projectId);

    if (!error) {
      setJobs((prev) =>
        prev.map((job) =>
          job.id === projectId
            ? { ...job, freelancer_id: freelancerid }
            : job
        )
      );
    } else {
      console.error("Error assigning freelancer:", error);
    }

    setAssigning(null);
  };

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
        jobs.map((job) => (
          <div key={job.id} className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-lg text-accent font-semibold">
                  {job.description?.title}
                </h2>
                <p className="text-gray-400 text-sm">{job.description?.details}</p>
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
                    const profile = app.freelancer?.profile || {};
                    const assigned = job.freelancer_id === app.freelancerid;

                    return (
                      <li key={app.freelancerid} className="p-3 rounded bg-[#222]">
                        <p className="text-white font-bold">
                          {profile.firstName} {profile.lastName}
                        </p>
                        <p className="text-sm text-gray-400">{profile.profession}</p>
                        <p className="text-sm text-gray-400">{profile.email}</p>

                        <button
                          className={`primary-btn mt-2 ${assigned || assigning === job.id ? "opacity-50 cursor-not-allowed" : ""}`}
                          disabled={assigned || assigning === job.id}
                          onClick={() => handleAssign(job.id, app.freelancerid)}
                        >
                          {assigned
                            ? "Assigned"
                            : assigning === job.id
                            ? "Assigning..."
                            : "Assign Freelancer"}
                        </button>
                      </li>
                    );
                  })
                )}
              </ul>
            )}
          </div>
        ))
      )}
    </section>
  );
}