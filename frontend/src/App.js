import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "./utils/supabaseClient";
import RoutesComponent from "./routes";

function App() {
  const {
    isAuthenticated,
    user,
    isLoading,
    loginWithRedirect
  } = useAuth0();

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentPath = location.pathname;
    if (!isLoading && !isAuthenticated && currentPath !== "/" && !currentPath.startsWith("/callback")) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, location.pathname]);

  const handleAuth = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    console.log("User is authenticated:", user);

    const userId = user.sub;
    const roles = user["https://blue-cliff-the-gig-is-up.app/roles"] || [];

    if (!user.email_verified) {
      console.log("Email not verified.");
      navigate("/verify-email");
      return;
    }

    if (roles.includes("admin")) {
      navigate("/admin");
      return;
    }

    try {
      if (roles.includes("client")) {
        const { data: client } = await supabase
          .from("clients")
          .select("status, profile")
          .eq("user_id", userId)
          .maybeSingle();

        if (!client?.profile) {
          navigate("/create-profile");
        } else if (client.status === "approved") {
          navigate("/client");
        } else {
          navigate("/pending");
        }
        return;
      }

      if (roles.includes("freelancer")) {
        const { data: freelancer } = await supabase
          .from("freelancers")
          .select("status, profile")
          .eq("user_id", userId)
          .maybeSingle();

        if (!freelancer?.profile) {
          navigate("/create-profile");
        } else if (freelancer.status === "approved") {
          navigate("/freelancer");
        } else {
          navigate("/pending");
        }
        return;
      }

      navigate("/register-role");
    } catch (error) {
      console.error("Authentication error:", error);
      navigate("/error");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user || location.pathname === "/register-role") return;
    handleAuth();
  }, [handleAuth, isAuthenticated, user, location.pathname]);

  if (isLoading) return <main><p>Loading...</p></main>;

  return <RoutesComponent />;
}

export default App;