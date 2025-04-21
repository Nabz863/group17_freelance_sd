import { useState } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function PostJobForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    requirements: "",
    budget: "",
    deadline: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const clientId = user?.sub;

    const { error } = await supabase.from("projects").insert({
      client_id: clientId,
      description: {
        title: formData.title,
        details: formData.description,
        requirements: formData.requirements,
        budget: formData.budget,
        deadline: formData.deadline
      },
      completed: false
    });

    if (!error) navigate("/client");
    else console.error("Job post submission failed:", error);
  };

  return (
    <ProfileFormLayout
      title="Post a New Job"
      subtitle="Describe your project and attract the right freelancers"
      onSubmit={handleSubmit}
    >
      <label className="form-label">
        Job Title:
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
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
        />
      </label>

      <label className="form-label">
        Budget (ZAR):
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="form-input"
          required
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

      <footer className="form-footer">
        <button type="submit" className="primary-btn">
          Submit Job
        </button>
      </footer>
    </ProfileFormLayout>
  );
}
