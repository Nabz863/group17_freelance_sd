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

  const handleAuth = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const userId = user.sub;

    if (userId === process.env.REACT_APP_AUTH0_ADMIN_ID) {
      if (location.pathname !== "/admin") {
        navigate("/admin");
      }
      return;
    }

    try {
      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("status, profile").eq("user_id", userId).maybeSingle(),
        supabase.from("freelancers").select("status, profile").eq("user_id", userId).maybeSingle()
      ]);

      const role = client ? "client" : freelancer ? "freelancer" : null;
      const profile = client?.profile || freelancer?.profile;
      const status = client?.status || freelancer?.status;

      if (!role) {
        if (location.pathname !== "/register-role") navigate("/register-role");
        return;
      }

      if (!profile) {
        if (location.pathname !== "/create-profile") navigate("/create-profile");
        return;
      }

      if (status === "approved") {
        if (location.pathname !== `/${role}`) navigate(`/${role}`);
      } else {
        if (location.pathname !== "/pending") navigate("/pending");
      }
    } catch (error) {
      console.error("Auth logic failed:", error);
      navigate("/error");
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  useEffect(() => {
    const publicPaths = ["/"];
    const currentPath = location.pathname;
  
    if (!isLoading && !isAuthenticated && !publicPaths.includes(currentPath)) {
      loginWithRedirect();
      return;
    }
  
    if (!isLoading && isAuthenticated && user) {
      if (!user.email_verified) {
        if (currentPath !== "/verify-email") {
          navigate("/verify-email");
        }
      }
      handleAuth();
    }
  }, [isLoading, isAuthenticated, user, location.pathname, loginWithRedirect, navigate, handleAuth]);

  if (isLoading) return <main><p>Loading...</p></main>;

  return <RoutesComponent />;
}

export default App;
