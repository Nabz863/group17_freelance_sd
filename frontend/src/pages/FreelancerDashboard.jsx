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
    portfolio_url: "",
    description: "",
  });

  useEffect(() => {
    if (!user?.sub) return;

    const fetchProfile = async () => {
      try {
        const { data, error } = await supabase
          .from("freelancers")
          .select("*")
          .eq("user_id", user.sub)
          .single();

        if (error) throw error;
        if (!data) {
          setProfile(null);
          return;
        }

        // Parse the JSON‐string profile into an object
        let parsed = data.profile;
        if (typeof parsed === "string") {
          try {
            parsed = JSON.parse(parsed);
          } catch {
            parsed = {};
          }
        }

        // Store the full record with parsed.profile
        setProfile({ ...data, profile: parsed });

        // Seed the form with the same data
        setFormData(prev => ({ ...prev, ...parsed }));
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.sub]);

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      // Save the JSON‐string back to the DB
      const payload = {
        profile: JSON.stringify(formData),
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase
        .from("freelancers")
        .update(payload)
        .eq("user_id", user.sub);

      if (error) throw error;

      // Refresh the local profile with the parsed object
      setProfile(prev => ({ ...prev, profile: { ...formData } }));
      setEditing(false);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  if (loading) {
    return <p>Loading profile...</p>;
  }
  if (!profile) {
    return <p>No profile found. Please complete your setup first.</p>;
  }

  return (
    <div className="profile-container">
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
          {/* …your inputs with value={formData.x} onChange… */}
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={() => {
              // reset the formData back to the parsed profile if they cancel
              setFormData({ ...profile.profile });
              setEditing(false);
            }}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded ml-2"
          >
            Cancel
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p>
            <strong>Name: </strong>
            {profile.profile.firstName} {profile.profile.lastName}
          </p>
          <p>
            <strong>Profession: </strong>
            {profile.profile.profession}
          </p>
          <p>
            <strong>Specialization: </strong>
            {profile.profile.specialization}
          </p>
          <p>
            <strong>Experience: </strong>
            {profile.profile.experience} years
          </p>
          <p>
            <strong>Hourly Rate: </strong>
            ZAR{" "}
            {parseFloat(profile.profile.hourly_rate || 0).toLocaleString()}/hr
          </p>
          <p>
            <strong>Location: </strong>
            {profile.profile.location}
          </p>
          <p>
            <strong>Availability: </strong>
            {profile.profile.availability}
          </p>
          <p>
            <strong>Phone: </strong>
            {profile.profile.phone}
          </p>
          <p>
            <strong>Portfolio: </strong>
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
