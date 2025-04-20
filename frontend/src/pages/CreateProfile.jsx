import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import supabase from "../utils/supabaseClient";
import "./styles/theme.css";

export default function CreateProfile() {
  const { user } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const checkRoleAndRedirect = async () => {
      const userId = user?.sub;
      if (!userId) return;

      const { data: client, error: clientError } = await supabase
        .from("clients")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (client && !clientError) {
        navigate("/client-profile");
        return;
      }

      const { data: freelancer, error: freelancerError } = await supabase
        .from("freelancers")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (freelancer && !freelancerError) {
        navigate("/freelancer-profile");
        return;
      }

      navigate("/register-role");
    };

    checkRoleAndRedirect();
  }, [user, navigate]);

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-[#0c0c0c] to-[#1a1a1a] text-white text-xl tracking-wide">
      <p className="animate-pulse">Loading your profile form...</p>
    </main>
  );
}
