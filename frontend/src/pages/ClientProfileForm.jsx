import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "./components/ProfileFormLayout";
import "./styles/theme.css";

export default function ClientProfileForm() {
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await supabase.auth.getUser();
    const userId = user.data.user?.id;

    const { error } = await supabase
      .from("clients")
      .update({ profile: formData, status: "pending" })
      .eq("user_id", userId);

    if (!error) navigate("/pending");
    else console.error("Client profile submission failed", error);
  };

  return (
    <ProfileFormLayout
      title="Client Profile"
      subtitle="Help us match you with the best freelancers for your business needs."
      onSubmit={handleSubmit}
    >
      <label>
        Company Name
        <input
          required
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
        />
      </label>

      <label>
        Industry
        <input
          required
          name="industry"
          value={formData.industry}
          onChange={handleChange}
        />
      </label>

      <label>
        Project Needs
        <textarea
          required
          name="projectNeeds"
          value={formData.projectNeeds}
          onChange={handleChange}
          rows="4"
        />
      </label>

      <label>
        Location
        <input
          required
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </label>

      <label>
        Budget Range
        <input
          required
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
        />
      </label>

      <label>
        Contact Email
        <input
          type="email"
          required
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
        />
      </label>

      <footer>
        <button type="submit">Submit Profile</button>
      </footer>
    </ProfileFormLayout>
  );
}
