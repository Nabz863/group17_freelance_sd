import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import RoutesComponent from "./routes";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  const handleAuth = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const userId = user.sub;

    // Hardcoded admin check
    if (userId === "auth0|YOUR_ADMIN_ID_HERE") {
      navigate("/admin");
      return;
    }

    try {
      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("status").eq("user_id", userId).single(),
        supabase.from("freelancers").select("status").eq("user_id", userId).single()
      ]);

      if (client) {
        navigate(client.status === "approved" ? "/client" : "/pending");
      } else if (freelancer) {
        navigate(freelancer.status === "approved" ? "/freelancer" : "/pending");
      } else {
        navigate("/register-role");
      }
    } catch (error) {
      console.error("Authentication error:", error);
      navigate("/error"); // Add an error route to your router
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  if (isLoading) return <div>Loading...</div>;

  return <RoutesComponent />;
}

export default App;
