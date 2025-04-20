import { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import FreelancerProfileForm from "./FreelancerProfileForm";
import ClientProfileForm from "./ClientProfileForm";

export default function CreateProfile() {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRole = async () => {
      const user = await supabase.auth.getUser();
      const userId = user.data.user?.id;

      const { data: client } = await supabase
        .from("clients")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      const { data: freelancer } = await supabase
        .from("freelancers")
        .select("user_id")
        .eq("user_id", userId)
        .maybeSingle();

      if (client) setRole("client");
      else if (freelancer) setRole("freelancer");

      setLoading(false);
    };

    fetchRole();
  }, []);

  if (loading) return <main><p>Loading profile form...</p></main>;
  if (!role) return <main><p>Role not found.</p></main>;

  return role === "client" ? <ClientProfileForm /> : <FreelancerProfileForm />;
}