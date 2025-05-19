import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function FreelancerProfile() {
  const { user } = useAuth0();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [editing, setEditing]   = useState(false);
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
    description: "",
  });

  useEffect(() => {
    if (!user?.sub) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("freelancers")
          .select("*, profile")     // make sure you include `profile`
          .eq("user_id", user.sub)
          .single();
        if (error) throw error;
        if (!data) {
          setProfile(null);
          return;
        }

        // Parse the JSON‐string in data.profile into an object
        let parsed = data.profile;
        if (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            parsed = {};
          }
        }

        // Merge parsed into the full record
        setProfile({ ...data, profile: parsed });

        // Seed the form values
        setFormData(prev => ({ ...prev, ...parsed, email: user.email }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.sub, user?.email]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const payload = {
        profile: JSON.stringify(formData),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("freelancers")
        .update(payload)
        .eq("user_id", user.sub);
      if (error) throw error;

      // Reflect changes locally
      setProfile(prev => ({ ...prev, profile: { ...formData } }));
      setEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  if (loading) {
    return <p className="text-white">Loading profile...</p>;
  }
  if (!profile) {
    return <p className="text-white">No profile found. Please complete your setup.</p>;
  }

  return (
    <div className="profile-container p-6 bg-[#0e0e0e] text-white rounded-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        )}
      </div>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* First & Last Name */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="form-label">
              First Name
              <input
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Last Name
              <input
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="form-input"
              />
            </label>
          </div>

          {/* Profession & Specialization */}
          <label className="form-label">
            Profession
            <input
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label className="form-label">
            Specialization
            <input
              name="specialization"
              value={formData.specialization}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>

          {/* Experience & Rate & Availability */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="form-label">
              Years of Experience
              <input
                type="number"
                min="0"
                name="experience"
                value={formData.experience}
                onChange={handleChange}
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Hourly Rate (ZAR)
              <input
                type="number"
                min="0"
                step="0.01"
                name="hourly_rate"
                value={formData.hourly_rate}
                onChange={handleChange}
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Availability
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                className="form-select"
              >
                <option value="">Select availability</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="weekends">Weekends only</option>
                <option value="evenings">Evenings only</option>
                <option value="contract">Contract</option>
              </select>
            </label>
          </div>

          {/* Contact & Portfolio */}
          <label className="form-label">
            Phone Number
            <input
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label className="form-label">
            Email
            <input
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label className="form-label">
            Portfolio URL
            <input
              name="portfolio_url"
              type="url"
              value={formData.portfolio_url}
              onChange={handleChange}
              className="form-input"
            />
          </label>

          {/* Skills & Description */}
          <label className="form-label">
            Skills (comma-separated)
            <input
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="form-input"
            />
          </label>
          <label className="form-label">
            Bio / Work Description
            <textarea
              name="description"
              rows="5"
              value={formData.description}
              onChange={handleChange}
              required
              className="form-textarea"
            />
          </label>

          <div className="flex space-x-2 pt-4">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 px-4 py-2 rounded text-white"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => {
                setFormData({ ...profile.profile, email: profile.profile.email });
                setEditing(false);
              }}
              className="bg-gray-500 hover:bg-gray-600 px-4 py-2 rounded text-white"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <p>
            <strong>Name:</strong> {profile.profile.firstName}{" "}
            {profile.profile.lastName}
          </p>
          <p>
            <strong>Profession:</strong> {profile.profile.profession}
          </p>
          <p>
            <strong>Specialization:</strong> {profile.profile.specialization}
          </p>
          <p>
            <strong>Experience:</strong> {profile.profile.experience} years
          </p>
          <p>
            <strong>Hourly Rate:</strong> ZAR{" "}
            {parseFloat(profile.profile.hourly_rate || 0).toLocaleString()}/hr
          </p>
          <p>
            <strong>Availability:</strong> {profile.profile.availability}
          </p>
          <p>
            <strong>Phone:</strong> {profile.profile.phone}
          </p>
          <p>
            <strong>Email:</strong> {profile.profile.email}
          </p>
          <p>
            <strong>Portfolio:</strong>{" "}
            {profile.profile.portfolio_url ? (
              <a
                href={profile.profile.portfolio_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:underline"
              >
                View
              </a>
            ) : (
              "N/A"
            )}
          </p>
          <p>
            <strong>Skills:</strong>{" "}
            {profile.profile.skills
              ?.split(",")
              .map((s, i) => (
                <span
                  key={i}
                  className="inline-block bg-gray-700 text-white px-2 py-1 rounded mr-1"
                >
                  {s.trim()}
                </span>
              ))}
          </p>
          <p>
            <strong>Description:</strong>
            <br />
            <span className="whitespace-pre-line">
              {profile.profile.description}
            </span>
          </p>
        </div>
      )}
    </div>
  );
}
