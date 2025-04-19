import { useEffect, useState } from "react";
import supabase from "../utils/supabaseClient";

export default function AdminDashboard() {
  const [pendingClients, setPendingClients] = useState([]);
  const [pendingFreelancers, setPendingFreelancers] = useState([]);

  useEffect(() => {
    const fetchPendingUsers = async () => {
      const { data: clients } = await supabase
        .from("clients")
        .select("user_id, profile")
        .eq("status", "pending");

      const { data: freelancers } = await supabase
        .from("freelancers")
        .select("user_id, profile")
        .eq("status", "pending");

      setPendingClients(clients || []);
      setPendingFreelancers(freelancers || []);
    };

    fetchPendingUsers();
  }, []);

  const handleApproval = async (userId, role, approved) => {
    const table = role === "client" ? "clients" : "freelancers";
    const status = approved ? "approved" : "rejected";

    await supabase.from(table).update({ status }).eq("user_id", userId);

    setPendingClients((prev) => prev.filter((c) => c.user_id !== userId));
    setPendingFreelancers((prev) => prev.filter((f) => f.user_id !== userId));
  };

  return (
    <main className="flex h-screen bg-gradient-to-br from-[#0e0e0e] to-[#1a1a1a] text-white">
      <aside className="w-64 bg-[#132d28] flex flex-col items-center py-6 shadow-md z-10">
        <h2 className="text-xl font-bold uppercase tracking-widest border-b-2 border-[#1abc9c] pb-3 mb-6">Admins</h2>
        {[
          "Account Settings",
          "Requests",
          "Freelancers",
          "Clients",
          "Projects",
          "Payments",
          "Reports",
        ].map((label) => (
          <button
            key={label}
            className="relative inline-block w-32 h-10 my-2 border-2 border-[#1abc9c] text-[#1abc9c] rounded-md font-medium overflow-hidden transition duration-500 ease-in-out hover:text-white group"
          >
            {label}
            <span className="absolute w-48 h-48 rounded-full bg-[#1abc9c] -top-10 -left-10 transform scale-0 group-hover:scale-150 transition-transform duration-700 ease-out z-[-1]" />
          </button>
        ))}
      </aside>

      <section className="flex-1 p-6 overflow-y-auto">
        <h1 className="text-3xl font-bold text-[#1abc9c] mb-6">Welcome to the Admin Panel</h1>

        <section className="mb-10">
          <h2 className="text-2xl mb-4">Pending Clients</h2>
          {pendingClients.length === 0 ? (
            <p className="text-gray-400">No pending clients</p>
          ) : (
            <ul className="space-y-4">
              {pendingClients.map((client) => (
                <li key={client.user_id} className="bg-[#1a1a1a] p-4 rounded-xl">
                  <p>User ID: {client.user_id}</p>
                  <p>Profile: {client.profile || "No profile uploaded"}</p>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleApproval(client.user_id, "client", true)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(client.user_id, "client", false)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section>
          <h2 className="text-2xl mb-4">Pending Freelancers</h2>
          {pendingFreelancers.length === 0 ? (
            <p className="text-gray-400">No pending freelancers</p>
          ) : (
            <ul className="space-y-4">
              {pendingFreelancers.map((freelancer) => (
                <li key={freelancer.user_id} className="bg-[#1a1a1a] p-4 rounded-xl">
                  <p>User ID: {freelancer.user_id}</p>
                  <p>Profile: {freelancer.profile || "No profile uploaded"}</p>
                  <div className="flex gap-4 mt-2">
                    <button
                      onClick={() => handleApproval(freelancer.user_id, "freelancer", true)}
                      className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleApproval(freelancer.user_id, "freelancer", false)}
                      className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </section>
    </main>
  );
}
