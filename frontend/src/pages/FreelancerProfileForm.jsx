import { useState, useEffect } from "react";
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
    specialization: "",
    experience: "",
    skills: "",
    hourly_rate: "",
    location: "",
    availability: "",
    phone: "",
    email: "",
    portfolio_url: "",
    description: ""
  });

  {/*const [files, setFiles] = useState({
    cv: null,
    qualification: null,
    certificates: []
  });*/}

  useEffect(() => {
    const checkFreelancer = async () => {
      if (!user) return;
      {/*{ data, error } */}
      const { data } = await supabase
        .from("freelancers")
        .select("profile")
        .eq("user_id", user.sub)
        .maybeSingle();

      if (!data) {
        console.warn("Freelancer role not found. Redirecting...");
        navigate("/create-profile");
        return;
      }

      setLoading(false);
    };

    checkFreelancer();
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  {/*const handleFileChange = (fileType, newFiles) => {
    if (fileType === "certificates") {
      setFiles(prev => ({
        ...prev,
        certificates: [...prev.certificates, ...newFiles]
      }));
    } else {
      setFiles(prev => ({
        ...prev,
        [fileType]: newFiles[0]
      }));
    }
  };*/}

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user?.sub;

    const { error } = await supabase
      .from("freelancers")
      .update({
        profile: formData,
        status: "pending"
      })
      .eq("user_id", userId);

    if (!error) {
      navigate("/pending");
    } else {
      console.error("Freelancer profile submission failed:", error);
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
      title="Freelancer Profile"
      subtitle="Tell us about your skills and experience to connect with clients"
      onSubmit={handleSubmit}
    >
      {/* Personal Information */}
      <div className="form-label">
        First Name
        <input
          required
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          className="form-input"
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
        />
      </div>

      <div className="form-label">
        Profession
        <input
          required
          name="profession"
          value={formData.profession}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label">
        Specialization
        <input
          required
          name="specialization"
          value={formData.specialization}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label">
        Years of Experience
        <input
          type="number"
          required
          name="experience"
          value={formData.experience}
          onChange={handleChange}
          className="form-input"
          min="0"
        />
      </div>

      <div className="form-label">
        Hourly Rate (ZAR)
        <input
          type="number"
          required
          name="hourly_rate"
          value={formData.hourly_rate}
          onChange={handleChange}
          className="form-input"
          min="0"
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

      <div className="form-label">
        Availability
        <select
          required
          name="availability"
          value={formData.availability}
          onChange={handleChange}
          className="form-select"
        >
          <option value="">Select availability</option>
          <option value="full-time">Full-time</option>
          <option value="part-time">Part-time</option>
          <option value="weekends">Weekends only</option>
          <option value="evenings">Evenings only</option>
          <option value="custom">Custom schedule</option>
        </select>
      </div>

      <div className="form-label">
        Phone Number
        <input
          type="tel"
          required
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label">
        Email
        <input
          type="email"
          required
          name="email"
          value={formData.email}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label">
        Portfolio URL
        <input
          type="url"
          name="portfolio_url"
          value={formData.portfolio_url}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label form-full-width">
        Skills (comma-separated)
        <input
          required
          name="skills"
          value={formData.skills}
          onChange={handleChange}
          className="form-input"
        />
      </div>

      <div className="form-label form-full-width">
        Bio / Work Description
        <textarea
          required
          name="description"
          value={formData.description}
          onChange={handleChange}
          className="form-textarea"
          rows="5"
        />
      </div>

      {/* File Uploads */}
      {/*<FileUpload 
        label="Curriculum Vitae (CV)"
        required={true}
        fileTypeLabel="Required"
        accept=".pdf,.doc,.docx"
        onChange={(files) => handleFileChange("cv", files)}
        fileType="cv"
      />
      <FileUpload 
        label="Latest Qualification"
        required={true}
        fileTypeLabel="Required"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(files) => handleFileChange("qualification", files)}
        fileType="qualification"
      />
      <FileUpload 
        label="Additional Certifications"
        required={false}
        fileTypeLabel="Optional"
        multiple={true}
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(files) => handleFileChange("certificates", files)}
        fileType="certificates"
      />*/}

      <div className="form-footer form-full-width">
        <button type="submit" className="primary-btn">
          Submit Profile
        </button>
      </div>
    </ProfileFormLayout>
  );
}
