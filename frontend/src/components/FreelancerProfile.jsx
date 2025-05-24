import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function FreelancerProfile() {
  const { user } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
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
    portfolio_url: "",
    description: "",
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from("freelancers")
          .select("*")
          .eq("user_id", user.sub)
          .single();

        if (data) {
          setProfile(data);
          if (data.profile) {
            const profileData =
              typeof data.profile === "string"
                ? JSON.parse(data.profile)
                : data.profile;
            setFormData((prev) => ({
              ...prev,
              ...profileData,
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.sub]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from("freelancers")
        .update({
          profile: JSON.stringify(formData),
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.sub);

      if (error) throw error;

      // Refresh the profile data
      const { data } = await supabase
        .from("freelancers")
        .select("*")
        .eq("user_id", user.sub)
        .single();

      setProfile(data);
      setEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }

  if (!profile) {
    return <p>No profile found. Please complete your profile setup first.</p>;
  }

  const availabilityOptions = [
    "full-time",
    "part-time",
    "contract",
    "freelance",
    "internship",
  ];

  return (
    <section className="profile-container">
      <section className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Profile Information</h2>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Edit Profile
          </button>
        )}
      </section>

      {editing ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-sm font-medium mb-1">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ""}
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
                value={formData.lastName || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </section>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-sm font-medium mb-1">
                Profession *
              </label>
              <input
                type="text"
                name="profession"
                value={formData.profession || ""}
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
                value={formData.specialization || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </section>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <section>
              <label className="block text-sm font-medium mb-1">
                Years of Experience *
              </label>
              <input
                type="number"
                name="experience"
                min="0"
                value={formData.experience || ""}
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
                value={formData.hourly_rate || ""}
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
                value={formData.availability || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              >
                <option value="">Select availability</option>
                {availabilityOptions.map((option) => (
                  <option key={option} value={option}>
                    {option.charAt(0).toUpperCase() + option.slice(1)}
                  </option>
                ))}
              </select>
            </section>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section>
              <label className="block text-sm font-medium mb-1">
                Location *
              </label>
              <input
                type="text"
                name="location"
                value={formData.location || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </section>
            <section>
              <label className="block text-sm font-medium mb-1">Phone *</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone || ""}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </section>
          </section>

          <section>
            <label className="block text-sm font-medium mb-1">
              Skills (comma separated) *
            </label>
            <input
              type="text"
              name="skills"
              value={formData.skills || ""}
              onChange={handleChange}
              placeholder="e.g., React, Node.js, UI/UX"
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <section>
            <label className="block text-sm font-medium mb-1">
              Portfolio URL
            </label>
            <input
              type="url"
              name="portfolio_url"
              value={formData.portfolio_url || ""}
              onChange={handleChange}
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <section>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description || ""}
              onChange={handleChange}
              rows={4}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </section>

          <section className="flex space-x-4 pt-4">
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
          </section>
        </form>
      ) : (
        <section className="space-y-4">
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="space-y-4">
              <section>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="text-white">
                  {profile.profile?.firstName} {profile.profile?.lastName}
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Profession</p>
                <p className="text-white">{profile.profile?.profession}</p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Specialization</p>
                <p className="text-white">
                  {profile.profile?.specialization || "Not specified"}
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Experience</p>
                <p className="text-white">
                  {profile.profile?.experience} years
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Hourly Rate</p>
                <p className="text-white">
                  ZAR{" "}
                  {parseFloat(
                    profile.profile?.hourly_rate || 0
                  ).toLocaleString()}
                  /hr
                </p>
              </section>
            </section>

            <section className="space-y-4">
              <section>
                <p className="text-sm text-gray-400">Email</p>
                <p className="text-white">
                  {profile.profile?.email || user.email}
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Phone</p>
                <p className="text-white">
                  {profile.profile?.phone || "Not provided"}
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Location</p>
                <p className="text-white">
                  {profile.profile?.location || "Not specified"}
                </p>
              </section>
              <section>
                <p className="text-sm text-gray-400">Availability</p>
                <p className="text-white capitalize">
                  {profile.profile?.availability || "Not specified"}
                </p>
              </section>
              {profile.profile?.portfolio_url && (
                <section>
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
                </section>
              )}
            </section>
          </section>

          <section className="pt-4">
            <p className="text-sm text-gray-400">Skills</p>
            <section className="flex flex-wrap gap-2 mt-1">
              {profile.profile?.skills
                ? profile.profile.skills.split(",").map((skill, index) => (
                    <p
                      key={index}
                      className="px-3 py-1 text-sm rounded-full bg-gray-700 text-white"
                    >
                      {skill.trim()}
                    </p>
                  ))
                : "No skills listed"}
            </section>
          </section>

          <section className="pt-4">
            <p className="text-sm text-gray-400">Description</p>
            <p className="text-white whitespace-pre-line">
              {profile.profile?.description || "No description provided"}
            </p>
          </section>
        </section>
      )}
    </section>
  );
}
