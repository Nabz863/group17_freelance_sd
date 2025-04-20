import { useAuth0 } from "@auth0/auth0-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import supabase from "../utils/supabaseClient";

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
        .select()
        .single();

      if (userError && userError.code !== "23505") throw userError;

      const table = role === "client" ? "clients" : "freelancers";
      const { error } = await supabase
        .from(table)
        .insert({ user_id: userId, status: "pending" });

      if (error) throw error;

      navigate("/create-profile");
    } catch (err) {
      console.error("Registration error:", err.message);
    }
  };

  return (
    <main className="page-center text-center text-white">
      <header>
        <h1 className="text-4xl font-bold text-accent mb-4">Choose Your Role</h1>
        <p className="text-lg text-muted mb-8">
          How would you like to use the platform?
        </p>
      </header>

      <form onSubmit={handleSubmit} className="form-grid max-w-md w-full">
        <fieldset>
          <legend className="sr-only">User Role</legend>

          <label className="flex items-center gap-4 justify-start cursor-pointer mb-4">
            <input
              type="radio"
              name="role"
              value="client"
              checked={role === "client"}
              onChange={() => setRole("client")}
              className="accent-accent"
            />
            <strong>Client – Post jobs & manage freelancers</strong>
          </label>

          <label className="flex items-center gap-4 justify-start cursor-pointer">
            <input
              type="radio"
              name="role"
              value="freelancer"
              checked={role === "freelancer"}
              onChange={() => setRole("freelancer")}
              className="accent-accent"
            />
            <strong>Freelancer – Apply to jobs & get paid</strong>
          </label>
        </fieldset>

        <footer className="mt-8">
          <button type="submit" className="btn-accent w-full">
            Continue
          </button>
        </footer>
      </form>
    </main>
  );
}