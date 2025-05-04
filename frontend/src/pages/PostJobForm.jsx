import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";
import axios from "axios";
import { toast } from "react-toastify";

export default function PostJobForm({ embed = false }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [deadline, setDeadline] = useState("");

  // Milestones state
  const [milestones, setMilestones] = useState([
    { title: "", description: "", dueDate: "", amount: "" },
  ]);

  // Contract template
  const [contractSections, setContractSections] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get("/api/contracts/template", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data.success && res.data.template.sections) {
          setContractSections(res.data.template.sections);
        }
      } catch (err) {
        console.error("Could not load contract template", err);
        toast.error("Failed to load contract template");
      }
    })();
  }, [getAccessTokenSilently]);

  const addMilestone = () =>
    setMilestones((m) => [
      ...m,
      { title: "", description: "", dueDate: "", amount: "" },
    ]);

  const removeMilestone = (i) =>
    setMilestones((m) => m.filter((_, idx) => idx !== i));

  const updateMilestone = (i, field, value) =>
    setMilestones((m) => {
      const copy = [...m];
      copy[i][field] = value;
      return copy;
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // validation
    if (!title.trim() || !description.trim() || !budget || !deadline) {
      toast.error("Please fill in all required fields");
      return;
    }
    for (let m of milestones) {
      if (!m.title.trim() || !m.dueDate || !m.amount) {
        toast.error("Please fill in every milestone");
        return;
      }
    }

    try {
      // 1) insert project
      const { data: project, error: pErr } = await supabase
        .from("projects")
        .insert({
          client_id: user.sub,
          title,
          description,
          budget: parseFloat(budget),
          deadline,
          include_contract: true,
        })
        .select("id")
        .single();
      if (pErr) throw pErr;

      // 2) insert milestones
      const mileRecords = milestones.map((m) => ({
        project_id: project.id,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount),
      }));
      const { error: mErr } = await supabase
        .from("milestones")
        .insert(mileRecords);
      if (mErr) throw mErr;

      // 3) create contract
      const token = await getAccessTokenSilently();
      const resp = await axios.post(
        "/api/contracts",
        {
          projectId: project.id,
          title: `Contract for ${title}`,
          freelancerId: null,
          contractSections,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!resp.data.success) throw new Error(resp.data.message);

      toast.success("Job posted, milestones set, contract generated!");
      if (!embed) navigate("/client");
      else {
        // reset
        setTitle("");
        setDescription("");
        setBudget("");
        setDeadline("");
        setMilestones([{ title: "", description: "", dueDate: "", amount: "" }]);
      }
    } catch (err) {
      console.error("Job post submission failed:", err);
      toast.error("Failed to post job or generate contract");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-4">
            Describe your project and set milestones &amp; payment
          </p>
        </>
      )}

      <label className="form-label">
        Job Title*
        <input
          className="form-input"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label className="form-label">
        Description*
        <textarea
          className="form-textarea"
          name="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows="4"
          required
        />
      </label>

      <label className="form-label">
        Budget (ZAR)*
        <input
          type="number"
          className="form-input"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          required
        />
      </label>

      <label className="form-label">
        Deadline*
        <input
          type="date"
          className="form-input"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
          required
        />
      </label>

      <div className="border border-gray-700 rounded-lg p-4">
        <h3 className="text-white font-semibold mb-2">Milestones</h3>
        {milestones.map((m, i) => (
          <div
            key={i}
            className="mb-4 p-3 bg-[#222] rounded border border-gray-700"
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-white font-medium">Milestone {i + 1}</span>
              <button
                type="button"
                onClick={() => removeMilestone(i)}
                disabled={milestones.length === 1}
                className="text-red-500 hover:text-red-400"
              >
                Remove
              </button>
            </div>
            <label className="form-label text-sm">
              Title*
              <input
                className="form-input text-sm"
                value={m.title}
                onChange={(e) =>
                  updateMilestone(i, "title", e.target.value)
                }
                required
              />
            </label>
            <label className="form-label text-sm mt-2">
              Amount (ZAR)*
              <input
                type="number"
                className="form-input text-sm"
                value={m.amount}
                onChange={(e) =>
                  updateMilestone(i, "amount", e.target.value)
                }
                required
              />
            </label>
            <label className="form-label text-sm mt-2">
              Due Date*
              <input
                type="date"
                className="form-input text-sm"
                value={m.dueDate}
                onChange={(e) =>
                  updateMilestone(i, "dueDate", e.target.value)
                }
                required
              />
            </label>
            <label className="form-label text-sm mt-2">
              Details
              <textarea
                className="form-textarea text-sm"
                rows="2"
                value={m.description}
                onChange={(e) =>
                  updateMilestone(i, "description", e.target.value)
                }
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={addMilestone}
          className="mt-1 px-3 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-800"
        >
          + Add Milestone
        </button>
      </div>

      <footer className="form-footer flex justify-end">
        {!embed && (
          <button
            type="button"
            onClick={() => navigate("/client")}
            className="border border-gray-600 px-4 py-1 rounded text-gray-300 hover:bg-gray-800 mr-2"
          >
            Cancel
          </button>
        )}
        <button type="submit" className="primary-btn">
          Post Job & Generate Contract
        </button>
      </footer>
    </form>
  );
}
