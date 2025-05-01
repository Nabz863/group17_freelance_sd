import { useState, useEffect } from "react";
import { useAuth0 }      from "@auth0/auth0-react";
import { useNavigate }   from "react-router-dom";
import axios             from "axios";

import supabase          from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import FileUpload        from "../components/FileUpload";
import "../styles/theme.css";

export default function FreelancerProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cvFile, setCvFile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "", lastName: "", profession: "", specialization: "",
    experience: "", skills: "", hourly_rate: "", location: "",
    availability: "", phone: "", email: "", portfolio_url: "",
    description: ""
  });

  // 1) Ensure row exists
  useEffect(() => {
    if (!user) return;
    supabase
      .from("freelancers")
      .select("profile")
      .eq("user_id", user.sub)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) navigate("/create-profile");
        else setLoading(false);
      });
  }, [user, navigate]);

  const handleChange = e =>
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  const handleFileChange = files => setCvFile(files[0]);

  // 2) Upload to Azure via our /api/upload route
  const uploadCv = async file => {
    const form = new FormData();
    form.append("file", file);
    form.append("fileType", "profile");
    form.append("userId", user.sub);
    const { data } = await axios.post("/api/upload", form, {
      headers: { "Content-Type": "multipart/form-data" }
    });
    return data.url;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!cvFile) return alert("Please upload your CV");
    setLoading(true);

    try {
      const profileUrl = await uploadCv(cvFile);
      const { error } = await supabase
        .from("freelancers")
        .update({ profile: profileUrl, status: "pending" })
        .eq("user_id", user.sub);
      if (error) throw error;
      navigate("/pending");
    } catch (err) {
      console.error(err);
      alert("Failed to submit profile");
      setLoading(false);
    }
  };

  if (loading) {
    return <main className="min-h-screen flex items-center justify-center text-white">
      <p className="animate-pulse">Loading form…</p>
    </main>;
  }

  return (
    <ProfileFormLayout
      title="Freelancer Profile"
      subtitle="Tell us about you and upload your CV"
      onSubmit={handleSubmit}
    >
      {/* personal info inputs, e.g.: */}
      <div className="form-label">
        First Name
        <input
          required name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      {/* …repeat for the rest of your formData fields… */}

      {/* CV Upload */}
      <FileUpload
        label="Upload Your CV (PDF)"
        required
        accept=".pdf"
        onChange={handleFileChange}
      />

      <div className="form-footer form-full-width">
        <button
          type="submit"
          className="primary-btn"
          disabled={!cvFile}
        >
          Submit Profile
        </button>
      </div>
    </ProfileFormLayout>
  );
}