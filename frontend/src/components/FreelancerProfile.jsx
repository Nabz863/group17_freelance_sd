// src/components/FreelancerProfile.jsx

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
    (async () => {
      const { data, error } = await supabase
        .from("freelancers")
        .select("*, profile")
        .eq("user_id", user.sub)
        .single();
      if (error) return console.error(error);

      let parsed = data.profile;
      if (typeof parsed === "string") {
        try { parsed = JSON.parse(parsed); }
        catch { parsed = {}; }
      }

      setProfile({ ...data, profile: parsed });
      setFormData({ ...parsed, email: user.email });
      setLoading(false);
    })();
  }, [user?.sub, user?.email]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const payload = {
      profile: JSON.stringify(formData)
    };
    const { error } = await supabase
      .from("freelancers")
      .update(payload)
      .eq("user_id", user.sub);
    if (error) return console.error(error);

    setProfile(prev => ({ ...prev, profile: { ...formData } }));
    setEditing(false);
  };

  if (loading) {
    return <p className="text-white">Loading profile…</p>;
  }
  if (!profile) {
    return <p className="text-white">No profile found. Complete setup first.</p>;
  }

  return (
    <div className="profile-container p-6 bg-[#0e0e0e] text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Freelancer Profile</h2>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-x-2">
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="profile-form"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form
          id="profile-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Profession *
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Specialization *
              </label>
              <input
                type="text"
                name="specialization"
                value={formData.specialization}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Years of Experience *
              </label>
              <input
                type="number"
                name="experience"
                min="0"
                value={formData.experience}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Hourly Rate (ZAR) *
              </label>
              <input
                type="number"
                name="hourly_rate"
                min="0"
                step="0.01"
                value={formData.hourly_rate}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Availability *
              </label>
              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              >
                <option value="">Select availability</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="weekends">Weekends only</option>
                <option value="evenings">Evenings only</option>
                <option value="contract">Contract</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <section className="block text-sm font-medium mb-1">
            Portfolio URL
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <section className="block text-sm font-medium mb-1">
            Skills (comma-separated) *
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <section className="block text-sm font-medium mb-1">
            Bio / Work Description *
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-medium">
                  {profile.profile.firstName}{" "}
                  {profile.profile.lastName}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Profession</p>
                <p className="font-medium">{profile.profile.profession}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Specialization</p>
                <p className="font-medium">{profile.profile.specialization}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Experience</p>
                <p className="font-medium">
                  {profile.profile.experience} years
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="font-medium">{profile.profile.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="font-medium">{profile.profile.phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium">{profile.profile.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Availability</p>
                <p className="font-medium capitalize">
                  {profile.profile.availability}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.profile.skills
                .split(",")
                .map((skill, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-gray-700 text-white rounded-full text-sm"
                  >
                    {skill.trim()}
                  </span>
                ))}
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">About Me</h3>
            <p className="whitespace-pre-line">{profile.profile.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
