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
    registrationType: "individual",
    firstName: "",
    lastName: "",
    companyName: "",
    industry: "",
    contactNumber: "",
    email: "",
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
      .select("profile")
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

  const handleToggle = () => {
    setFormData((f) => ({
      ...f,
      registrationType: f.registrationType === "individual" ? "company" : "individual",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { error } = await supabase
      .from("clients")
      .update({profile: formData, status: "pending"})
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
      subtitle="Tell us about yourself or your company to get started"
      onSubmit={handleSubmit}
    >
      <section className="form-full-width">
        <label className="form-label">Registering As</label>
        <section className="flex items-center gap-4">
          <label className="text-white font-medium">
            Individual
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={formData.registrationType === "company"}
            onClick={handleToggle}
            className={`relative w-14 h-8 bg-[#444] rounded-full transition-colors duration-300 
              ${formData.registrationType === "company" ? "bg-[#1abc9c]" : "bg-[#444]"}`}
          >
            <span
              className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform duration-300 
                ${formData.registrationType === "company" ? "translate-x-6" : "translate-x-0"}`}
            />
          </button>
          <label className="text-white font-medium">
            Company
          </label>
        </section>
      </section>

      {formData.registrationType === "company" && (
        <label className="form-label form-full-width">
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
      )}

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
        Industry / Sector
        <input
          id="industry"
          name="industry"
          required
          value={formData.industry}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label">
        Contact Number
        <input
          id="contactNumber"
          name="contactNumber"
          required
          value={formData.contactNumber}
          onChange={handleChange}
          className="form-input"
          type="tel"
        />
      </label>

      <label className="form-label">
        Email
        <input
          id="email"
          name="email"
          required
          value={formData.email}
          onChange={handleChange}
          className="form-input"
          type="email"
        />
      </label>

      <footer className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </footer>
    </ProfileFormLayout>
  );
}