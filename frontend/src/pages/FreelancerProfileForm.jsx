import { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import "../styles/theme.css";

export default function FreelancerProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
    specialization: "",
    experience: "",
    skills: "",
    hourly_rate: "",
    location: "",
    availability: "",
    phone: "",
    email: "",
    portfolio_url: "",
    description: ""
  });

  useEffect(() => {
    const checkFreelancer = async () => {
      if (!user) return;
      const { data } = await supabase
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
      .update({
        profile: formData,
        status: "pending"
      })
      .eq("user_id", userId);

    if (!error) {
      navigate("/pending");
    } else {
      console.error("Freelancer profile submission failed:", error);
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
      title="Freelancer Profile"
      subtitle="Tell us about your skills and experience to connect with clients"
      onSubmit={handleSubmit}
    >
      <label htmlFor="firstName" className="form-label">
        First Name
        <input
          id="firstName"
          required
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="lastName" className="form-label">
        Last Name
        <input
          id="lastName"
          required
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="profession" className="form-label">
        Profession
        <input
          id="profession"
          required
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="specialization" className="form-label">
        Specialization
        <input
          id="specialization"
          required
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="experience" className="form-label">
        Years of Experience
        <input
          id="experience"
          type="number"
          required
          name="experience"
          min="0"
          value={formData.experience}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="hourly_rate" className="form-label">
        Hourly Rate (ZAR)
        <input
          id="hourly_rate"
          type="number"
          required
          name="hourly_rate"
          min="0"
          value={formData.hourly_rate}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="location" className="form-label">
        Location
        <input
          id="location"
          required
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="availability" className="form-label">
        Availability
        <select
          id="availability"
          required
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select availability</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="weekends">Weekends only</option>
          <option value="evenings">Evenings only</option>
          <option value="custom">Custom schedule</option>
        </select>
      </label>

      <label htmlFor="phone" className="form-label">
        Phone Number
        <input
          id="phone"
          type="tel"
          required
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="email" className="form-label">
        Email
        <input
          id="email"
          type="email"
          required
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="portfolio_url" className="form-label">
        Portfolio URL
        <input
          id="portfolio_url"
          type="url"
          name="portfolio_url"
          value={formData.portfolio_url}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="skills" className="form-label form-full-width">
        Skills (comma-separated)
        <input
          id="skills"
          required
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label htmlFor="description" className="form-label form-full-width">
        Bio / Work Description
        <textarea
          id="description"
          required
          name="description"
          rows="5"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
        />
      </label>

      <div className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </div>
    </ProfileFormLayout>
  );
}