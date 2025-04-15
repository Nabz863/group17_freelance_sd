import { useAuth0 } from "@auth0/auth0-react";
import { createClient } from "@supabase/supabase-js";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const supabase = createClient("https://your-project.supabase.co", "public-anon-key");

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
    <div className="p-8">
      <h1 className="text-xl font-bold">Choose Your Role</h1>
      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <label>
          <input
            type="radio"
            name="role"
            value="client"
            checked={role === "client"}
            onChange={() => setRole("client")}
          />{" "}
          Client
        </label>
        <label>
          <input
            type="radio"
            name="role"
            value="freelancer"
            checked={role === "freelancer"}
            onChange={() => setRole("freelancer")}
          />{" "}
          Freelancer
        </label>
        <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
      </form>
    </div>
  );
}