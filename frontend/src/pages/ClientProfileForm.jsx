import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import "../styles/theme.css";

export default function ClientProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    industry: "",
    type: "individual", // default
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("profile")
      .eq("user_id", user.sub)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) {
          navigate("/create-profile");
        } else {
          setLoading(false);
        }
      });
  }, [user, navigate]);

  const handleChange = (e) =>
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleTypeToggle = () =>
    setFormData((f) => ({
      ...f,
      type: f.type === "individual" ? "company" : "individual",
    }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("clients")
      .update({ profile: formData, status: "pending" })
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
      subtitle="Tell us about your company to get started"
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

      <section className="form-full-width" style={{ marginTop: "1rem" }}>
        <strong className="text-white mb-2 block">
          Are you registering as an Individual or Company?
        </strong>
        <section style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <span className="text-white">Individual</span>
          <label className="switch">
            <input
              type="checkbox"
              checked={formData.type === "company"}
              onChange={handleTypeToggle}
            />
            <span className="slider round"></span>
          </label>
          <span className="text-white">Company</span>
        </section>
      </section>

      <section className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </section>
    </ProfileFormLayout>
  );
}