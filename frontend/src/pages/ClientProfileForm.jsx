import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function ClientProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    companyName: "",
    industry: "",
    projectNeeds: "",
    location: "",
    budgetRange: "",
    contactEmail: ""
  });

  useEffect(() => {
    const checkClient = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("profile")
        .eq("user_id", user.sub)
        .maybeSingle();

      if (!data) {
        console.warn("Client role not found. Redirecting...");
        navigate("/create-profile");
        return;
      }

      setLoading(false);
    };

    checkClient();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.sub;

    const { error } = await supabase
      .from("clients")
      .update({ profile: formData, status: "pending" })
      .eq("user_id", userId);

    if (!error) navigate("/pending");
    else console.error("Client profile submission failed", error);
  };

  if (loading) return <main className="text-white text-center p-10">Loading...</main>;

  return (
    <ProfileFormLayout
      title="Client Profile"
      subtitle="Help us match you with the best freelancers for your business needs"
      onSubmit={handleSubmit}
    >
      <label className="form-label">
        Company Name
        <input
          required
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Industry
        <input
          required
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Project Needs
        <textarea
          required
          name="projectNeeds"
          value={formData.projectNeeds}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
        />
      </label>

      <label className="form-label">
        Location
        <input
          required
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Budget Range
        <input
          required
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Contact Email
        <input
          required
          type="email"
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
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
