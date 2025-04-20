import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function ClientProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    projectNeeds: "",
    location: "",
    budgetRange: "",
    contactEmail: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = user?.sub;
    if (!userId) {
      console.error("Missing Auth0 user ID");
      return;
    }

    const { error } = await supabase
      .from("clients")
      .update({ profile: formData, status: "pending" })
      .eq("user_id", userId);

    if (error) {
      console.error("Client profile submission failed:", error);
    } else {
      navigate("/pending");
    }
  };

  return (
    <ProfileFormLayout
      title="Client Profile"
      subtitle="Help us match you with the best freelancers for your business needs."
      onSubmit={handleSubmit}
    >
      <label>
        Company Name:
        <input
          type="text"
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Industry:
        <input
          type="text"
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Project Needs:
        <textarea
          name="projectNeeds"
          value={formData.projectNeeds}
          onChange={handleChange}
          rows="4"
          required
          className="form-textarea"
        />
      </label>

      <label>
        Location:
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Budget Range:
        <input
          type="text"
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Contact Email:
        <input
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <footer className="form-footer">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </footer>
    </ProfileFormLayout>
  );
}
