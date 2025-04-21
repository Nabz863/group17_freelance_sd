import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import "./styles/theme.css";

export default function ClientProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    clientType: "business",
    industry: "",
    projectNeeds: "",
    location: "",
    budgetRange: "",
    projectTimeline: "",
    contactPhone: "",
    contactEmail: "",
    preferredContact: "email"
  });

  useEffect(() => {
    const checkClient = async () => {
      if (!user) return;

      const { data, error } = await supabase
        .from("clients")
        .select("profile")
        .eq("user_id", user.sub)
        .maybeSingle();

      if (error) console.error("Supabase error:", error);
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
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "clientType" && value === "individual") {
      setFormData((prev) => ({ ...prev, companyName: "" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.sub;
    setLoading(true);

    const { error } = await supabase
      .from("clients")
      .update({
        profile: formData,
        status: "pending"
      })
      .eq("user_id", userId);

    if (!error) {
      navigate("/pending");
    } else {
      console.error("Client profile submission failed:", error);
      setLoading(false);
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
      subtitle="Help us match you with the best freelancers for your needs"
      onSubmit={handleSubmit}
    >
      <div className="form-label form-full-width">
        I am a:
        <div className="flex gap-4 mt-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="clientType"
              value="business"
              checked={formData.clientType === "business"}
              onChange={handleChange}
              className="mr-2"
            />
            Business/Organization
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="clientType"
              value="individual"
              checked={formData.clientType === "individual"}
              onChange={handleChange}
              className="mr-2"
            />
            Individual/Household
          </label>
        </div>
      </div>

      <div className="form-label">
        First Name
        <input
          required
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="form-input"
          placeholder="Your first name"
        />
      </div>

      <div className="form-label">
        Last Name
        <input
          required
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          className="form-input"
          placeholder="Your last name"
        />
      </div>

      {formData.clientType === "business" && (
        <div className="form-label form-full-width">
          Company/Organization Name
          <input
            required
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
            className="form-input"
            placeholder="Your company or organization name"
          />
        </div>
      )}

      <div className="form-label">
        Industry/Sector
        <input
          required
          name="industry"
          value={formData.industry}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label">
        Location
        <input
          required
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label form-full-width">
        Project Needs
        <textarea
          required
          name="projectNeeds"
          value={formData.projectNeeds}
          onChange={handleChange}
          className="form-textarea"
          rows="4"
        />
      </div>

      <div className="form-label">
        Budget Range
        <select
          required
          name="budgetRange"
          value={formData.budgetRange}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select budget range</option>
          <option value="under-5000">Under R5,000</option>
          <option value="5000-10000">R5,000 - R10,000</option>
          <option value="10000-25000">R10,000 - R25,000</option>
          <option value="25000-50000">R25,000 - R50,000</option>
          <option value="50000-100000">R50,000 - R100,000</option>
          <option value="over-100000">Over R100,000</option>
          <option value="hourly">Hourly rate</option>
        </select>
      </div>

      <div className="form-label">
        Project Timeline
        <select
          required
          name="projectTimeline"
          value={formData.projectTimeline}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select timeline</option>
          <option value="urgent">Urgent (ASAP)</option>
          <option value="1-week">Within 1 week</option>
          <option value="2-weeks">Within 2 weeks</option>
          <option value="1-month">Within 1 month</option>
          <option value="3-months">Within 3 months</option>
          <option value="flexible">Flexible</option>
          <option value="ongoing">Ongoing</option>
        </select>
      </div>

      <div className="form-label">
        Contact Phone
        <input
          type="tel"
          required
          name="contactPhone"
          value={formData.contactPhone}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label">
        Contact Email
        <input
          type="email"
          required
          name="contactEmail"
          value={formData.contactEmail}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label form-full-width">
        Preferred Contact Method
        <div className="flex gap-4 mt-2">
          <label className="flex items-center">
            <input
              type="radio"
              name="preferredContact"
              value="email"
              checked={formData.preferredContact === "email"}
              onChange={handleChange}
              className="mr-2"
            />
            Email
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="preferredContact"
              value="phone"
              checked={formData.preferredContact === "phone"}
              onChange={handleChange}
              className="mr-2"
            />
            Phone
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="preferredContact"
              value="whatsapp"
              checked={formData.preferredContact === "whatsapp"}
              onChange={handleChange}
              className="mr-2"
            />
            WhatsApp
          </label>
        </div>
      </div>

      <div className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </div>
    </ProfileFormLayout>
  );
}
