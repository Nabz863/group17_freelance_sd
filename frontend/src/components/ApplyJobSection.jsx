import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";

export default function ApplyJobSection() {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const fetchJobs = async () => {
      setLoading(true);
      setError("");

      try {
        const [{ data: projectData, error: projectError }, { data: appsData, error: appsError }] = await Promise.all([
          supabase.from("projects").select("id, description, created_at, clients!inner(*)").is("freelancer_id", null).eq("completed", false),
          supabase.from("applications").select("projectid").eq("freelancerid", user.sub).cast("projectid", "uuid"),
        ]);

        if (projectError || appsError) {
          throw projectError || appsError;
        }

        const parsedProjects = (projectData || []).map((p) => {
          let desc = p.description;
          if (typeof desc === "string") {
            try {
              desc = JSON.parse(desc);
            } catch {
              desc = {};
            }
          }
          return { ...p, description: desc };
        });

        setProjects(parsedProjects);
        setAppliedProjectIds(appsData?.map((a) => a.projectid) || []);
      } catch (err) {
        console.error("Error loading job data", err);
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user]);

  const handleApply = async (projectId) => {
    if (appliedProjectIds.includes(projectId)) {
      alert("You’ve already applied to this job.");
      return;
    }

    const { error } = await supabase.from("applications").insert({
      applicationid: `app_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      freelancerid: user.sub,
      projectid: projectId,
      status: "pending",
    });

    if (error) {
      console.error("Failed to apply to project:", error);
      alert("Failed to apply. Try again.");
    } else {
      setAppliedProjectIds((prev) => [...prev, projectId]);
    }
  };

  return (
    <section className="dashboard-content">
      <h1>Available Jobs</h1>

      {loading ? (
        <p className="text-gray-400 mt-4">Loading...</p>
      ) : error ? (
        <p className="text-red-500 mt-4">{error}</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400 mt-4">No jobs available right now.</p>
      ) : (
        <section className="grid gap-6 mt-6">
          {projects.map((proj) => {
            const { title, details, requirements, budget, deadline } =
              proj.description || {};
            const applied = appliedProjectIds.includes(proj.id);

            return (
              <section
                key={proj.id}
                className="card-glow p-5 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]"
              >
                <h2 className="text-xl text-accent font-bold">{title}</h2>
                <p className="text-sm text-gray-300 mt-1">{details}</p>
                {requirements && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Requirements:</strong> {requirements}
                  </p>
                )}
                {budget && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Budget:</strong> R{budget}
                  </p>
                )}
                {deadline && (
                  <p className="text-sm text-gray-500 mt-2">
                    <strong>Deadline:</strong> {deadline}
                  </p>
                )}
                <button
                  className={`primary-btn mt-2 ${
                    applied ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={applied}
                  onClick={() => handleApply(proj.id)}
                >
                  {applied ? "Application Submitted" : "Apply Now"}
                </button>
              </section>
            );
          })}
        </section>
      )}
    </section>
  );
}
