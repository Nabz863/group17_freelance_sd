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

    if (userId === process.env.REACT_APP_AUTH0_ADMIN_ID) {
      navigate("/admin");
      return;
    }

    try {
      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("status").eq("user_id", userId).maybeSingle(),
        supabase.from("freelancers").select("status").eq("user_id", userId).maybeSingle()
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
      navigate("/error");
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    console.log("Current location:", location.pathname);
    if (location.pathname === "/") return;
    handleAuth();
  }, [handleAuth, location.pathname]);

  useEffect(() => {
    if (!isAuthenticated || !user || location.pathname === "/register-role") return;
    handleAuth();
  }, [handleAuth, isAuthenticated, user, location.pathname])

  if (isLoading) return <main><p>Loading...</p></main>;

  return <RoutesComponent />;
}

export default App;