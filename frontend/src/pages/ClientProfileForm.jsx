import React, { useState, useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import FileUpload from "../components/FileUpload";
import "../styles/theme.css";

export default function ClientProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    industry: "",
  });
  const [pdfFile, setPdfFile] = useState(null);

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
  const handleFileChange = (files) => setPdfFile(files[0]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    await supabase
      .from("clients")
      .update({ profileData: formData, status: "pending" })
      .eq("user_id", user.sub);

    if (pdfFile) {
      const { data: uploadData, error: uploadErr } = await supabase.storage
        .from(process.env.REACT_APP_AZURE_BLOB_CONTAINER)
        .upload(`profiles/${user.sub}.pdf`, pdfFile);
      if (!uploadErr) {
        const url = supabase.storage
          .from(process.env.REACT_APP_AZURE_BLOB_CONTAINER)
          .getPublicUrl(uploadData.path).publicUrl;
        await supabase
          .from("clients")
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
      title="Client Profile"
      subtitle="Tell us about your company and upload your profile PDF"
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

      <fieldset className="form-full-width">
        <legend className="form-label">Upload Profile PDF</legend>
        <FileUpload
          accept=".pdf"
          required
          onChange={handleFileChange}
          fileType="profilePdf"
        />
      </fieldset>

      <footer className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </footer>
    </ProfileFormLayout>
  );
}