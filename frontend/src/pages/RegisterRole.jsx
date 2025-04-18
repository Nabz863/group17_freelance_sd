import { useAuth0 } from "@auth0/auth0-react";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function RegisterRole() {
  const { user } = useAuth0();
  const [role, setRole] = useState("client");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const userId = user.sub;

    await supabase.from("users").insert({ id: userId }).onConflict("id").ignore();

    if (role === "client") {
      await supabase.from("clients").insert({ user_id: userId, status: "pending" });
    } else {
      await supabase.from("freelancers").insert({ user_id: userId, status: "pending" });
    }

    navigate("/pending");
  };

  return (
    <main>
      <h1>Select Role</h1>
      <form onSubmit={handleSubmit}>
        <label>
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === "client"}
            onChange={() => setRole("client")}
          />
          Client
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="freelancer"
            checked={role === "freelancer"}
            onChange={() => setRole("freelancer")}
          />
          Freelancer
        </label>
        <button type="submit">Continue</button>
      </form>
    </main>
  );
}
