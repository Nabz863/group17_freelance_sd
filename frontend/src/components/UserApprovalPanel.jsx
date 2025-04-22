import { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";
import "../styles/theme.css";

export default function UserApprovalPanel() {
  const [clients, setClients] = useState([]);
  const [freelancers, setFreelancers] = useState([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: c }, { data: f }] = await Promise.all([
        supabase.from("clients").select("user_id, profile").eq("status", "pending"),
        supabase.from("freelancers").select("user_id, profile").eq("status", "pending"),
      ]);
      setClients(c || []);
      setFreelancers(f || []);
    };
    load();
  }, []);

  const handleAction = async (table, userId, approved) => {
    const status = approved ? "approved" : "rejected";
    await supabase.from(table).update({ status }).eq("user_id", userId);
    if (table === "clients") setClients((prev) => prev.filter((u) => u.user_id !== userId));
    else setFreelancers((prev) => prev.filter((u) => u.user_id !== userId));
  };

  const renderList = (users, type) => (
    <section className="mb-6">
      <h2 className="text-xl text-accent mb-2">Pending {type}</h2>
      {users.length === 0 ? (
        <p className="text-gray-500">None</p>
      ) : (
        users.map((u) => (
          <article key={u.user_id} className="bg-[#1a1a1a] p-4 rounded-lg mb-3">
            <p className="text-sm mb-1">User ID: {u.user_id}</p>
            <p className="text-sm mb-2">Profile: {JSON.stringify(u.profile)}</p>
            <div className="flex gap-4">
              <button className="bg-green-600 px-3 py-1 rounded" onClick={() => handleAction(type.toLowerCase(), u.user_id, true)}>Approve</button>
              <button className="bg-red-600 px-3 py-1 rounded" onClick={() => handleAction(type.toLowerCase(), u.user_id, false)}>Reject</button>
            </div>
          </article>
        ))
      )}
    </section>
  );

  return (
    <>
      {renderList(clients, "Clients")}
      {renderList(freelancers, "Freelancers")}
    </>
  );
}
