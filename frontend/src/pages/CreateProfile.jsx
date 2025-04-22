import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function CreateProfile() {
  const { user } = useAuth0();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      if (!user) return;

      const userId = user.sub;

      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("user_id").eq("user_id", userId).maybeSingle(),
        supabase.from("freelancers").select("user_id").eq("user_id", userId).maybeSingle()
      ]);

      if (client) {
        navigate("/create-client-profile");
      } else if (freelancer) {
        navigate("/create-freelancer-profile");
      } else {
        console.warn("No role found for user. Redirecting to /register-role.");
        navigate("/register-role");
      }

      setLoading(false);
    };

    checkRoleAndRedirect();
  }, [user, navigate]);

  if (loading) {
    return (
      <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c0c0c] to-[#1a1a1a] text-white text-xl tracking-wide">
        <p className="animate-pulse">Checking your role...</p>
      </main>
    );
  }

  return null;
}
