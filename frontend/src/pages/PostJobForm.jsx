// src/pages/PostJobForm.jsx
import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import axios from "axios";
import "../styles/theme.css";

export default function PostJobForm({ embed = false }) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    budget: "",
    deadline: ""
  });
  const [milestones, setMilestones] = useState([
    { title: "", description: "", dueDate: "", amount: "" }
  ]);
  const [includeContract, setIncludeContract] = useState(false);
  const [contractSections, setContractSections] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch contract template when toggled on
  useEffect(() => {
    if (!includeContract) return;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get("/api/contracts/template", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setContractSections(res.data.template.sections);
        }
      } catch (err) {
        console.error("Failed to load contract template:", err);
      }
    })();
  }, [includeContract, getAccessTokenSilently]);

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const addMilestone = () =>
    setMilestones([
      ...milestones,
      { title: "", description: "", dueDate: "", amount: "" }
    ]);

  const removeMilestone = (idx) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const changeMilestone = (idx, field, val) => {
    const copy = [...milestones];
    copy[idx][field] = val;
    setMilestones(copy);
  };

  const validate = () => {
    const { title, description, budget, deadline } = formData;
    if (!title.trim()) return "Job Title is required";
    if (!description.trim()) return "Project Description is required";
    if (!budget) return "Budget is required";
    if (!deadline) return "Deadline is required";
    for (let m of milestones) {
      if (!m.title.trim()) return "Each milestone needs a title";
      if (!m.dueDate) return "Each milestone needs a due date";
      if (!m.amount) return "Each milestone needs an amount";
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      alert(err);
      return;
    }
    setIsLoading(true);

    try {
      // 1) Create project
      const clientId = user.sub;
      const { data: project, error: projErr } = await supabase
        .from("projects")
        .insert({
          client_id: clientId,
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
      if (projErr) throw projErr;

      // 2) Insert milestones
      const toInsert = milestones.map((m) => ({
        project_id: project.id,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount)
      }));
      const { error: msErr } = await supabase
        .from("milestones")
        .insert(toInsert);
      if (msErr) throw msErr;

      // 3) Create contract if requested
      if (includeContract) {
        const token = await getAccessTokenSilently();
        await axios.post(
          "/api/contracts",
          { projectId: project.id, sections: contractSections },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Job post failed:", err);
      alert("Failed to post job. See console for details.");
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
      className="space-y-6 max-w-2xl mx-auto p-4"
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
        Job Title*
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label className="form-label">
        Project Description*
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="form-textarea"
        />
      </label>

      <label className="form-label">
        Requirements
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows="3"
          className="form-textarea"
        />
      </label>

      <label className="form-label">
        Budget (ZAR)*
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label className="form-label">
        Deadline*
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      {/* Milestones */}
      <div className="border border-gray-700 rounded p-4">
        <h2 className="text-lg text-white mb-2">Milestones</h2>
        {milestones.map((m, i) => (
          <div key={i} className="mb-4 p-3 bg-[#1a1a1a] rounded">
            <div className="flex justify-between mb-2">
              <strong className="text-white">Milestone {i + 1}</strong>
              <button
                type="button"
                onClick={() => removeMilestone(i)}
                disabled={milestones.length === 1}
                className="text-red-500"
              >
                Remove
              </button>
            </div>
            <label className="form-label">
              Title*
              <input
                value={m.title}
                onChange={(e) =>
                  changeMilestone(i, "title", e.target.value)
                }
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Due Date*
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) =>
                  changeMilestone(i, "dueDate", e.target.value)
                }
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Amount (ZAR)*
              <input
                type="number"
                value={m.amount}
                onChange={(e) =>
                  changeMilestone(i, "amount", e.target.value)
                }
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Description
              <textarea
                rows="2"
                value={m.description}
                onChange={(e) =>
                  changeMilestone(i, "description", e.target.value)
                }
                className="form-textarea"
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={addMilestone}
          className="primary-btn"
        >
          + Add Milestone
        </button>
      </div>

      {/* Include Contract */}
      <label className="form-label flex items-center">
        <input
          type="checkbox"
          checked={includeContract}
          onChange={() => setIncludeContract((v) => !v)}
          className="mr-2"
        />
        Include standard contract
      </label>

      <footer className="form-footer">
        <button
          type="submit"
          disabled={isLoading}
          className="primary-btn"
        >
          {isLoading ? "Posting..." : "Submit Job"}
        </button>
      </footer>
    </form>
  );
}