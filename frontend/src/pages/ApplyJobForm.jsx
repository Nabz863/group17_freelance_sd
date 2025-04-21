import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import { v4 as uuidv4 } from "uuid";
import "./styles/theme.css";

export default function ApplyJobForm() {
  const { projectId } = useParams();
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [coverLetter, setCoverLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const applicationID = uuidv4();
    const freelancerID = user?.sub;

    const { error } = await supabase.from("applications").insert({
      applicationID,
      freelancerID,
      projectID: projectId,
      coverLetter,
      status: "pending"
    });

    setSubmitting(false);

    if (error) {
      console.error("Application error:", error);
      alert("Failed to submit application.");
    } else {
      navigate("/freelancer");
    }
  };

  return (
    <main className="min-h-screen bg-[#0e0e0e] text-white p-10">
      <header className="mb-10 text-center">
        <h1 className="text-4xl font-bold text-[#1abc9c] mb-2">Apply for Job</h1>
        <p className="text-gray-400">Project ID: {projectId}</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="max-w-3xl mx-auto flex flex-col gap-6"
        aria-label="Job application form"
      >
        <label className="form-label" htmlFor="coverLetter">
          Cover Letter
          <textarea
            id="coverLetter"
            name="coverLetter"
            rows="6"
            required
            value={coverLetter}
            onChange={(e) => setCoverLetter(e.target.value)}
            className="form-textarea"
            aria-required="true"
          />
        </label>

        <footer className="form-footer">
          <button
            type="submit"
            disabled={submitting}
            className="primary-btn"
          >
            {submitting ? "Submitting..." : "Submit Application"}
          </button>
        </footer>
      </form>
    </main>
  );
}
