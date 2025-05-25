import { useEffect, useCallback } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "./utils/supabaseClient";
import { createClient } from '@supabase/supabase-js';
import RoutesComponent from "./routes";

window.supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

export default function App() {
  const { isAuthenticated, user, isLoading, loginWithRedirect } = useAuth0();
  const navigate = useNavigate();
  const location = useLocation();

  const handleAuth = useCallback(async () => {
    if (!isAuthenticated || !user) return;

    const userId = user.sub;

    if (userId === process.env.REACT_APP_AUTH0_ADMIN_ID) {
      if (location.pathname !== "/admin") navigate("/admin");
      return;
    }

    if (!user.email_verified) {
      if (location.pathname !== "/verify-email") navigate("/verify-email");
      return;
    }

    try {
      const [{ data: client }, { data: freelancer }] = await Promise.all([
        supabase.from("clients").select("status, profile").eq("user_id", userId).maybeSingle(),
        supabase.from("freelancers").select("status, profile").eq("user_id", userId).maybeSingle()
      ]);

      const isClient = !!client;
      const isFreelancer = !!freelancer;
      const profile = client?.profile || freelancer?.profile;
      const status = client?.status || freelancer?.status;

      if (!isClient && !isFreelancer) {
        if (location.pathname !== "/register-role") navigate("/register-role");
        return;
      }

      if (!profile) {
        const profilePath = isClient ? "/create-client-profile" : "/create-freelancer-profile";
        if (location.pathname !== profilePath) navigate(profilePath);
        return;
      }

      if (status !== "approved") {
        if (location.pathname !== "/pending") navigate("/pending");
        return;
      }

      const dashboard = isClient ? "/client" : "/freelancer";
      const protectedPaths = ["/client", "/freelancer", "/post-job", "/review-applicants"]; //whitelist
      if (!protectedPaths.includes(location.pathname)) {
        navigate(dashboard);
      }
    } catch (err) {
      console.error("Auth logic failed:", err);
      navigate("/error");
    }
  }, [isAuthenticated, user, location.pathname, navigate]);

  useEffect(() => {
    if (isLoading) return;

    const publicPaths = ["/"];
    if (!isAuthenticated && !publicPaths.includes(location.pathname)) {
      loginWithRedirect();
    } else if (isAuthenticated && user) {
      handleAuth();
    }
  }, [isLoading, isAuthenticated, user, location.pathname, handleAuth, loginWithRedirect]);

  if (isLoading) return <main><p>Loading...</p></main>;

  return <RoutesComponent />;
}