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
    <div className="profile-container">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!editing && (
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
      </section>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </section>
            <section>
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
            </section>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </section>
            <section>
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
            </section>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
            </section>
            <section>
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
            </section>
            <section>
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
            </section>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </section>
          </section>

          <div>
            <label className="block text-sm font-medium mb-1">
              Skills (comma separated) *
            </label>
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <div>
            <label className="block text-sm font-medium mb-1">
              Portfolio URL
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              rows={4}
              value={formData.description}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Save Changes
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-medium">
                  {profile.profile.firstName}{" "}
                  {profile.profile.lastName}
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Profession</p>
                <p className="text-white">{profile.profile?.profession}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Specialization</p>
                <p className="text-white">
                  {profile.profile?.specialization || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Experience</p>
                <p className="font-medium">
                  {profile.profile.experience} years
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Hourly Rate</p>
                <p className="text-white">
                  ZAR{" "}
                  {parseFloat(
                    profile.profile?.hourly_rate || 0
                  ).toLocaleString()}
                  /hr
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">
                  {profile.profile?.email || user.email}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">
                  {profile.profile?.phone || "Not provided"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white">
                  {profile.profile?.location || "Not specified"}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Availability</p>
                <p className="font-medium capitalize">
                  {profile.profile.availability}
                </p>
              </div>
              {profile.profile?.portfolio_url && (
                <div>
                  <p className="text-sm text-gray-400">Portfolio</p>
                  <a
                    href={
                      profile.profile.portfolio_url.startsWith("http")
                        ? profile.profile.portfolio_url
                        : `https://${profile.profile.portfolio_url}`
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:underline"
                  >
                    View Portfolio
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-400">Skills</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.profile?.skills
                ? profile.profile.skills.split(",").map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-gray-700 text-white"
                    >
                      {skill.trim()}
                    </span>
                  ))
                : "No skills listed"}
            </div>
          </div>

          <div className="pt-4">
            <p className="text-sm text-gray-400">Description</p>
            <p className="text-white whitespace-pre-line">
              {profile.profile?.description || "No description provided"}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
