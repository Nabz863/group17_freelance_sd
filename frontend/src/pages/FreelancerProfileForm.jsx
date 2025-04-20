import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function FreelancerProfileForm() {
  const [formData, setFormData] = useState({
    profession: "",
    experience: "",
    skills: "",
    hourly_rate: "",
    description: ""
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { error } = await supabase
      .from("freelancers")
      .update({ profile: formData, status: "pending" })
      .eq("user_id", userId);

    if (!error) navigate("/pending");
    else console.error("Profile submission failed", error);
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
        />
      </label>

      <footer>
        <button type="submit">Submit Profile</button>
      </footer>
    </ProfileFormLayout>
  );
}
