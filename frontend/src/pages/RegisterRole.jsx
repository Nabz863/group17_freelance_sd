import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function RegisterRole() {
  const { user } = useAuth0();
  const [role, setRole] = useState("client");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user.sub;
    try {
      const { error: userError } = await supabase
        .from("users")
        .insert({ id: userId })
        .select();

      if (userError && userError.code !== "23505") throw userError;

      const table = role === "client" ? "clients" : "freelancers";
      const { error } = await supabase
        .from(table)
        .insert({ user_id: userId, status: "pending" });

      if (error) throw error;
      navigate(role === "client" ? "/create-client-profile" : "/create-freelancer-profile");
    } catch (err) {
      console.error("Registration error:", err.message);
    }
  };

  return (
    <main className="landing-container">
      <section className="hero-section">
        <h1 className="hero-title">Choose Your Role</h1>
        <p className="hero-subtitle">Select how you'd like to use the platform.</p>
        <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-6 items-center">
          <fieldset className="flex flex-col gap-4">
            <label>
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === "client"}
                onChange={() => setRole("client")}
              />
              <strong className="ml-2">Client – Post and manage projects</strong>
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="freelancer"
                checked={role === "freelancer"}
                onChange={() => setRole("freelancer")}
              />
              <strong className="ml-2">Freelancer – Apply and get hired</strong>
            </label>
          </fieldset>
          <button type="submit" className="get-started-btn">Continue</button>
        </form>
      </section>
    </main>
  );
}
