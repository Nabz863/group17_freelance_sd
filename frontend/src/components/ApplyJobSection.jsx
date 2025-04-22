import { useEffect, useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function ApplyJobSection() {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [appliedProjectIds, setAppliedProjectIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;

      setLoading(true);

      const { data: allProjects, error: projectError } = await supabase
        .from("projects")
        .select("*")
        .eq("completed", false)
        .is("freelancer_id", null);

        const { data: applications, error: appError } = await supabase
        .from("applications")
        .select("projectid")
        .eq("freelancerid", user.sub);

      if (projectError || appError) {
        console.error("Error loading job data", projectError || appError);
      } else {
        setProjects(allProjects || []);
        setAppliedProjectIds(applications.map((a) => a.projectID));
      }

      setLoading(false);
    };

    loadData();
  }, [user]);

  const handleApply = async (projectId) => {
    const { error } = await supabase.from("applications").insert({
        applicationid: crypto.randomUUID(),
        freelancerid: user.sub,
        projectid: projectId,
        status: "pending"
      });

    if (error) {
      console.error("Application failed:", error);
    } else {
      setAppliedProjectIds((prev) => [...prev, projectId]);
    }
  };

  return (
    <section className="dashboard-content">
      <h1>Available Jobs</h1>
      {loading ? (
        <p className="text-gray-400 mt-4">Loading...</p>
      ) : projects.length === 0 ? (
        <p className="text-gray-400 mt-4">No jobs available right now.</p>
      ) : (
        <div className="grid gap-6 mt-6">
          {projects.map((proj) => {
            const { title, details, requirements, budget, deadline } =
              proj.description || {};
            const applied = appliedProjectIds.includes(proj.id);

            return (
              <div
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
                <p className="text-sm text-gray-500 mt-1">
                  <strong>Budget:</strong> R{budget}
                </p>
                <p className="text-sm text-gray-500 mb-3">
                  <strong>Deadline:</strong> {deadline}
                </p>
                <button
                  className={`primary-btn mt-2 ${
                    applied ? "opacity-60 cursor-not-allowed" : ""
                  }`}
                  disabled={applied}
                  onClick={() => handleApply(proj.id)}
                >
                  {applied ? "Application Submitted" : "Apply Now"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

