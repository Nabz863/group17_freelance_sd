// src/pages/PostJobForm.jsx
import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function PostJobForm({ embed = false }) {
  const { user } = useAuth0();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    budget: "",
    deadline: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.sub) {
      alert("You must be logged in to post a job.");
      return;
    }

    setIsLoading(true);
    try {
      // 1) Insert the project
      const { data: project, error: projectError } = await supabase
        .from("projects")
        .insert({
          client_id: user.sub,
          description: {
            title: formData.title,
            details: formData.description,
            requirements: formData.requirements,
            budget: formData.budget,
            deadline: formData.deadline
          },
          completed: false
        })
        .select("id")
        .single();

      if (projectError) throw projectError;

      // 2) (Optional) If you have milestone logic here, you would:
      // await supabase
      //   .from("milestones")
      //   .insert([...yourMilestones.map(m => ({ project_id: project.id, ...m }))]);

      setSubmitted(true);
    } catch (err) {
      console.error("Job post submission failed:", err);
      alert("Failed to post job—check console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="text-center">
        <h1 className="text-accent text-2xl mb-4">Job Posted Successfully</h1>
        <p>Your job is now live for freelancers to apply.</p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto p-6 bg-[#1a1a1a] rounded-lg border border-[#1abc9c]"
    >
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-6">
            Describe your project and attract the right freelancers
          </p>
        </>
      )}

      <label className="form-label">
        Job Title:
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
          placeholder="e.g. Build me a React app"
        />
      </label>

      <label className="form-label">
        Project Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="form-textarea"
          placeholder="Provide all the details here..."
        />
      </label>

      <label className="form-label">
        Requirements:
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows="3"
          className="form-textarea"
          placeholder="List any must-haves (optional)"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="form-label">
          Budget (ZAR):
          <input
            type="number"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            className="form-input"
            required
            min="1"
            placeholder="e.g. 5000"
          />
        </label>

        <label className="form-label">
          Deadline:
          <input
            type="date"
            name="deadline"
            value={formData.deadline}
            onChange={handleChange}
            className="form-input"
            required
          />
        </label>
      </div>

      <footer className="form-footer flex justify-end">
        <button
          type="submit"
          className="primary-btn"
          disabled={isLoading}
        >
          {isLoading ? "Posting…" : "Submit Job"}
        </button>
      </footer>
    </form>
  );
}