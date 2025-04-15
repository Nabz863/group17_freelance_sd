import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createClient } from "@supabase/supabase-js";
import RoutesComponent from "./routes";

const supabase = createClient("https://your-project.supabase.co", "public-anon-key");

function App() {
  const { isAuthenticated, user, isLoading } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth = async () => {
      if (!isAuthenticated || !user) return;

      const userId = user.sub;

      // Hardcoded admin check
      if (userId === "auth0|YOUR_ADMIN_ID_HERE") {
        navigate("/admin");
        return;
      }

      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("status").eq("user_id", userId).single(),
        supabase.from("freelancers").select("status").eq("user_id", userId).single()
      ]);

      if (client) {
        client.status === "approved" ? navigate("/client") : navigate("/pending");
      } else if (freelancer) {
        freelancer.status === "approved" ? navigate("/freelancer") : navigate("/pending");
      } else {
        navigate("/register-role");
      }
    };

    handleAuth();
  }, [isAuthenticated, user]);

  if (isLoading) return <div>Loading...</div>;

  return <RoutesComponent />;
}

export default App;