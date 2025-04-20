import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function FreelancerProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    profession: "",
    experience: "",
    skills: "",
    hourly_rate: "",
    description: ""
  });

  useEffect(() => {
    const checkFreelancer = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("freelancers")
        .select("profile")
        .eq("user_id", user.sub)
        .maybeSingle();

      if (!data) {
        console.warn("Freelancer role not found. Redirecting...");
        navigate("/create-profile");
        return;
      }

      setLoading(false);
    };

    checkFreelancer();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.sub;

    const { error } = await supabase
    .from("freelancers")
    .update({ profile: formData, status: "pending" })
    .eq("user_id", userId);
  
  if (!error) {
    navigate("/pending");
  } else {
    console.error("Freelancer profile submission failed:", error);
  }
  };

  if (loading) return <main className="text-white text-center p-10">Loading...</main>;

  return (
    <ProfileFormLayout
      title="Freelancer Profile"
      subtitle="Let clients know who you are and what you do"
      onSubmit={handleSubmit}
    >
      <label className="form-label">
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

      <label className="form-label">
        Years of Experience:
        <input
          type="number"
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          required
          min="0"
          className="form-input"
        />
      </label>

      <label className="form-label">
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

      <label className="form-label">
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

      <label className="form-label">
        Bio / Work Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows="5"
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
