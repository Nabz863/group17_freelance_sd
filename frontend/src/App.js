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
    const isPublic = ["/"].includes(currentPath);

    if (!isLoading && !isAuthenticated && !isPublic) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect, location.pathname]);

  const handleAuth = useCallback(async () => {
    if (!isAuthenticated || !user) return;

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

      const hasProfile = client?.profile || freelancer?.profile;

      if (client) {
        if (!hasProfile) {
          navigate("/create-profile");
        } else if (client.status === "approved") {
          navigate("/client");
        } else {
          navigate("/pending");
        }
      } else if (freelancer) {
        if (!hasProfile) {
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
      console.error("Authentication error:", error);
      navigate("/error");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    if (["/", "/callback"].includes(location.pathname)) {
      handleAuth();
    }
  }, [handleAuth, isAuthenticated, user, location.pathname]);

  if (isLoading) return <main><p>Loading...</p></main>;

  return <RoutesComponent />;
}

export default App;