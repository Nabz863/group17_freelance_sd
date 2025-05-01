import { useState, useEffect } from "react";
import { useAuth0 }      from "@auth0/auth0-react";
import { useNavigate }   from "react-router-dom";
import axios             from "axios";

import supabase          from "../utils/supabaseClient";
import ProfileFormLayout from "../components/ProfileFormLayout";
import FileUpload        from "../components/FileUpload";
import "../styles/theme.css";

export default function ClientProfileForm() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [profileFile, setProfileFile] = useState(null);
  const [formData, setFormData] = useState({
    companyName: "",
    website: "",
    description: ""
  });

  useEffect(() => {
    if (!user) return;
    supabase
      .from("clients")
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
  const handleFileChange = files => setProfileFile(files[0]);

  const uploadProfile = async file => {
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
    if (!profileFile) return alert("Please upload your company profile PDF");
    setLoading(true);

    try {
      const profileUrl = await uploadProfile(profileFile);
      const { error } = await supabase
        .from("clients")
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
      title="Client Profile"
      subtitle="Tell us about your company and upload your profile PDF"
      onSubmit={handleSubmit}
    >
      <div className="form-label">
        Company Name
        <input
          required name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      <div className="form-label">
        Website
        <input
          name="website"
          value={formData.website}
          onChange={handleChange}
          className="form-input"
        />
      </div>
      <div className="form-label form-full-width">
        Description
        <textarea
          required name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
        />
      </div>
      
      <FileUpload
        label="Upload Profile PDF"
        required
        accept=".pdf"
        onChange={handleFileChange}
      />

      <div className="form-footer form-full-width">
        <button
          type="submit"
          className="primary-btn"
          disabled={!profileFile}
        >
          Submit Profile
        </button>
      </div>
    </ProfileFormLayout>
  );
}