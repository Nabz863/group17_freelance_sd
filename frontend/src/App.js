import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "./utils/supabaseClient";
import RoutesComponent from "./routes";

function App() {
  const { isAuthenticated, user, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  // 👇 Redirect to Auth0 login from any non-public path if not authenticated
  useEffect(() => {
    const publicPaths = ["/"];
    if (!isLoading && !isAuthenticated && !publicPaths.includes(location.pathname)) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, location.pathname, loginWithRedirect]);

  // 👇 Handle all routing logic after login
  const handlePostLoginRouting = useCallback(async () => {
    if (!user) return;

    const userId = user.sub;

    if (!user.email_verified) {
      navigate("/verify-email");
      return;
    }

    if (userId === process.env.REACT_APP_AUTH0_ADMIN_ID) {
      navigate("/admin");
      return;
    }

    try {
      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("status, profile").eq("user_id", userId).maybeSingle(),
        supabase.from("freelancers").select("status, profile").eq("user_id", userId).maybeSingle()
      ]);

      const profileExists = client?.profile || freelancer?.profile;

      if (client) {
        if (!profileExists) {
          navigate("/create-profile");
        } else if (client.status === "approved") {
          navigate("/client");
        } else {
          navigate("/pending");
        }
      } else if (freelancer) {
        if (!profileExists) {
          navigate("/create-profile");
        } else if (freelancer.status === "approved") {
          navigate("/freelancer");
        } else {
          navigate("/pending");
        }
      } else {
        navigate("/register-role");
      }
    } catch (error) {
      console.error("Routing error:", error);
      navigate("/error");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (isAuthenticated && !isLoading && location.pathname === "/") {
      handlePostLoginRouting(); // 👈 prevent flicker back to landing
    }
  }, [isAuthenticated, isLoading, location.pathname, handlePostLoginRouting]);

  if (isLoading) return <main><p>Loading...</p></main>;

  return <RoutesComponent />;
}

export default App;
