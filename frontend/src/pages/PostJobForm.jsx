// src/pages/PostJobForm.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import { toast } from "react-toastify";
import supabase from "../utils/supabaseClient";
import axios from "axios";
import "../styles/theme.css";

export default function PostJobForm({ embed = false }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Job form fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [requirements, setRequirements] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");

  // Milestones
  const [milestones, setMilestones] = useState([
    { title: "", description: "", dueDate: "", amount: "" }
  ]);

  // Contract sections (fetched once)
  const [contractSections, setContractSections] = useState([]);

  // Fetch standard template up front
  React.useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const resp = await axios.get("/api/contracts/template", {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.data.success) {
          setContractSections(resp.data.template.sections);
        }
      } catch (err) {
        console.error("Could not load contract template:", err);
        toast.error("Failed to load contract template");
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddMilestone = () =>
    setMilestones((m) => [
      ...m,
      { title: "", description: "", dueDate: "", amount: "" }
    ]);
  const handleRemoveMilestone = (idx) =>
    setMilestones((m) => m.filter((_, i) => i !== idx));
  const handleMilestoneChange = (idx, field, val) => {
    setMilestones((m) => {
      const copy = [...m];
      copy[idx][field] = val;
      return copy;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.sub) {
      toast.error("You must be logged in to post a job.");
      return;
    }

    setIsLoading(true);
    try {
      // 1) create project
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          client_id: user.sub,
          description: JSON.stringify({
            title,
            details: description,
            requirements,
            budget,
            deadline
          }),
          completed: false
        })
        .select("id")
        .single();
      if (pErr) throw pErr;

      // 2) create milestones
      const toInsert = milestones
        .filter((m) => m.title.trim())
        .map((m) => ({
          project_id: project.id,
          title: m.title,
          description: m.description,
          due_date: m.dueDate,
          amount: parseFloat(m.amount)
        }));
      if (toInsert.length) {
        const { error: mErr } = await supabase
          .from("milestones")
          .insert(toInsert);
        if (mErr) throw mErr;
      }

      // 3) always generate contract & PDF
      {
        const token = await getAccessTokenSilently();
        const resp = await axios.post(
          "/api/contracts",
          {
            title: `Contract for ${title}`,
            clientId: user.sub,
            projectId: project.id,
            contractSections
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!resp.data.success) {
          console.error("Contract API error:", resp.data);
          throw new Error("Contract generation failed");
        }
        toast.success("Contract generated and sent for review");
      }

      toast.success("Job posted successfully!");
      setSubmitted(true);
    } catch (err) {
      console.error(err);
      toast.error("Failed to post job. See console for details.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="text-center p-6">
        <h1 className="text-accent text-2xl mb-4">
          Job & Contract Sent!
        </h1>
        <p>
          Your job is live and your contract has been generated. Freelancers will
          receive it to propose edits.
        </p>
        {!embed && (
          <button
            onClick={() => navigate("/client")}
            className="mt-4 primary-btn"
          >
            Back to Dashboard
          </button>
        )}
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-3xl mx-auto p-6 bg-[#1a1a1a] rounded-lg border border-[#1abc9c]"
    >
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-6">
            Describe your project and automatically generate a contract.
          </p>
        </>
      )}

      {/* --- Job fields --- */}
      <label className="form-label">
        Job Title*
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="form-input"
          placeholder="e.g. Build me a React app"
        />
      </label>

      <label className="form-label">
        Description*
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          required
          className="form-textarea"
        />
      </label>

      <label className="form-label">
        Requirements
        <textarea
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          rows="3"
          className="form-textarea"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="form-label">
          Budget (ZAR)*
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            min="1"
            className="form-input"
          />
        </label>
        <label className="form-label">
          Deadline*
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
            className="form-input"
          />
        </label>
      </div>

      {/* --- Milestones --- */}
      <div className="border border-gray-700 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-white mb-3">
          Milestones & Payments
        </h3>
        {milestones.map((m, idx) => (
          <div
            key={idx}
            className="mb-4 p-4 border border-gray-700 rounded bg-[#1a1a1a]"
          >
            <div className="flex justify-between items-center">
              <h4 className="text-white font-medium">
                Milestone {idx + 1}
              </h4>
              <button
                type="button"
                disabled={milestones.length === 1}
                onClick={() => handleRemoveMilestone(idx)}
                className="text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>

            <input
              type="text"
              placeholder="Title"
              value={m.title}
              onChange={(e) =>
                handleMilestoneChange(idx, "title", e.target.value)
              }
              className="form-input mt-2"
              required
            />
            <textarea
              placeholder="Description"
              value={m.description}
              onChange={(e) =>
                handleMilestoneChange(idx, "description", e.target.value)
              }
              rows="2"
              className="form-textarea mt-2"
            />
            <div className="grid md:grid-cols-2 gap-4 mt-2">
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) =>
                  handleMilestoneChange(idx, "dueDate", e.target.value)
                }
                className="form-input"
                required
              />
              <input
                type="number"
                placeholder="Amount (ZAR)"
                value={m.amount}
                onChange={(e) =>
                  handleMilestoneChange(idx, "amount", e.target.value)
                }
                className="form-input"
                min="1"
                required
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMilestone}
          className="px-4 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-800"
        >
          + Add Milestone
        </button>
      </div>

      {/* --- Submit --- */}
      <footer className="form-footer flex justify-end">
        {!embed && (
          <button
            type="button"
            onClick={() => navigate("/client")}
            className="px-6 py-2 mr-4 border border-gray-600 rounded text-gray-300 hover:bg-gray-800"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#1abc9c] rounded text-white hover:bg-[#16a085] disabled:opacity-50"
        >
          {isLoading ? "Posting…" : "Post Job"}
        </button>
      </footer>
    </form>
  );
}