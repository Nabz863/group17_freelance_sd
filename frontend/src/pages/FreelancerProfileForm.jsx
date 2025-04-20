import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function FreelancerProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    profession: "",
    experience: "",
    skills: "",
    hourly_rate: "",
    description: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = user?.sub;
    if (!userId) {
      console.error("Auth0 user ID is missing.");
      return;
    }

    const { error } = await supabase
      .from("freelancers")
      .update({ profile: formData, status: "pending" })
      .eq("user_id", userId);

    if (error) {
      console.error("Profile submission failed:", error);
    } else {
      navigate("/pending");
    }
  };

  return (
    <ProfileFormLayout
      title="Freelancer Profile"
      subtitle="Let clients know who you are and what you do"
      onSubmit={handleSubmit}
    >
      <label>
        Profession:
        <input
          type="text"
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Years of Experience:
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          min="0"
          required
          className="form-input"
        />
      </label>

      <label>
        Skills (comma-separated):
        <input
          type="text"
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Hourly Rate (ZAR):
        <input
          type="number"
          name="hourly_rate"
          value={formData.hourly_rate}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label>
        Bio / Work Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="5"
          required
          className="form-textarea"
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
