import React, {useState, useEffect} from "react";
import {useAuth0} from "@auth0/auth0-react";
import {useNavigate} from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import "../styles/theme.css";

export default function ClientProfileForm() {
  const {user} = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    industry: "",
    registrationType: "individual",
    companyName: "",
    companySize: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("profileData")
      .eq("user_id", user.sub)
      .maybeSingle()
      .then(({data}) => {
        if (!data) {
          navigate("/create-profile");
        } else {
          setLoading(false);
        }
      });
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData((f) => ({...f, [e.target.name]: e.target.value}));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const {error} = await supabase
      .from("clients")
      .update({ profileData: formData, status: "pending" })
      .eq("user_id", user.sub);

    if (error) {
      console.error("Failed to submit profile:", error);
    } else {
      navigate("/pending");
    }
  };

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c0c0c] to-[#1a1a1a] text-white text-xl tracking-wide">
        <p className="animate-pulse">Loading your profile form...</p>
      </main>
    );
  }

  return (
    <ProfileFormLayout
      title="Client Profile"
      subtitle="Tell us about your company or yourself"
      onSubmit={handleSubmit}
    >
      <label className="form-label">
        First Name
        <input
          id="firstName"
          name="firstName"
          required
          value={formData.firstName}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Last Name
        <input
          id="lastName"
          name="lastName"
          required
          value={formData.lastName}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Industry/Sector
        <input
          id="industry"
          name="industry"
          required
          value={formData.industry}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label form-full-width">
        Registering as
        <select
          id="registrationType"
          name="registrationType"
          value={formData.registrationType}
          onChange={handleChange}
          className="form-select"
        >
          <option value="individual">Individual</option>
          <option value="company">Company</option>
        </select>
      </label>

      {formData.registrationType === "company" && (
        <>
          <label className="form-label">
            Company Name
            <input
              id="companyName"
              name="companyName"
              required
              value={formData.companyName}
              onChange={handleChange}
              className="form-input"
            />
          </label>

          <label className="form-label">
            Company Size
            <input
              id="companySize"
              name="companySize"
              required
              value={formData.companySize}
              onChange={handleChange}
              className="form-input"
            />
          </label>
        </>
      )}

      <footer className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </footer>
    </ProfileFormLayout>
  );
}