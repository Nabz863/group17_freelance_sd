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
  
    try {
      const { error: userError } = await supabase
        .from("users")
        .insert({ id: userId })
        .onConflict("id")
        .ignore();
  
      if (userError) throw userError;
  
      if (role === "client") {
        const { error } = await supabase
          .from("clients")
          .insert({ user_id: userId, status: "pending" });
  
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("freelancers")
          .insert({ user_id: userId, status: "pending" });
  
        if (error) throw error;
      }
  
      navigate("/pending");
    } catch (err) {
      console.error("Registration error:", err.message);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 text-gray-800 flex items-center justify-center p-6">
      <section className="bg-white rounded-xl shadow-xl p-10 w-full max-w-md">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-[#1abc9c]">Choose Your Role</h1>
          <p className="text-sm text-gray-600">Select how you'd like to use the platform.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <fieldset className="space-y-4">
            <legend className="sr-only">Role</legend>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="client"
                checked={role === "client"}
                onChange={() => setRole("client")}
                className="accent-[#1abc9c]"
              />
              <span className="text-md">Client – Post projects & hire freelancers</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name="role"
                value="freelancer"
                checked={role === "freelancer"}
                onChange={() => setRole("freelancer")}
                className="accent-[#1abc9c]"
              />
              <span className="text-md">Freelancer – Apply to jobs & get paid</span>
            </label>
          </fieldset>

          <footer>
            <button
              type="submit"
              className="w-full bg-[#1abc9c] hover:bg-[#16a085] text-white font-semibold py-2 px-4 rounded transition"
            >
              Continue
            </button>
          </footer>
        </form>
      </section>
    </main>
  );
}