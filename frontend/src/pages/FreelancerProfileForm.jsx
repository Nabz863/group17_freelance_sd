import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import FileUpload from "../components/FileUpload";
import "../styles/theme.css";

export default function FreelancerProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    profession: "",
  });
  const [cvFile, setCvFile] = useState(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("freelancers")
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
  const handleFileChange = (files) => setCvFile(files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase
      .from("freelancers")
      .update({ profileData: formData, status: "pending" })
      .eq("user_id", user.sub);

    if (cvFile) {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(process.env.REACT_APP_AZURE_BLOB_CONTAINER)
        .upload(`cvs/${user.sub}.pdf`, cvFile);
      if (!uploadErr) {
        const url = supabase.storage
          .from(process.env.REACT_APP_AZURE_BLOB_CONTAINER)
          .getPublicUrl(uploadData.path).publicUrl;
        await supabase
          .from("freelancers")
          .update({ profile: url })
          .eq("user_id", user.sub);
      }
    }

    navigate("/pending");
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
      subtitle="Tell us about you and upload your CV"
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
        Profession
        <input
          id="profession"
          name="profession"
          required
          value={formData.profession}
          onChange={handleChange}
          className="form-input"
        />
      </label>

      <label className="form-label form-full-width">
        Upload Your CV (PDF)
        <FileUpload
          accept=".pdf"
          required
          onChange={handleFileChange}
          fileType="cv"
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