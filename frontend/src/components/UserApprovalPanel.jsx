import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function UserApprovalPanel() {
  const [clients, setClients] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPending = async () => {
      const clientQuery = supabase
        .from('clients')
        .select('*')
        .eq('status', 'pending');
      const freelancerQuery = supabase
        .from('freelancers')
        .select('*')
        .eq('status', 'pending');

      const [clientsRes, freelancersRes] = await Promise.all([
        clientQuery,
        freelancerQuery,
      ]);

      setClients(clientsRes.data || []);
      setFreelancers(freelancersRes.data || []);
      setLoading(false);
    };

    const timer = setTimeout(fetchPending, 0);
    return () => clearTimeout(timer);
  }, []);

  const handleStatusChange = async (table, userId, newStatus) => {
    const { error } = await supabase
      .from(table)
      .update({ status: newStatus })
      .eq('user_id', userId);

    if (error) {
      console.error(`Error updating ${table}`, error);
      return;
    }

    if (table === 'clients') {
      setClients((prev) => prev.filter((u) => u.user_id !== userId));
    } else {
      setFreelancers((prev) => prev.filter((u) => u.user_id !== userId));
    }
  };

  return (
    <div>
      <h3>Pending Clients</h3>
      <table className="w-full text-white">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Profile</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(loading || clients.length === 0) ? (
            <tr>
              <td className="text-center italic" colSpan={3}>
                None
              </td>
            </tr>
          ) : (
            clients.map((u) => (
              <tr key={u.user_id}>
                <td>User ID: {u.user_id}</td>
                <td>Profile: {JSON.stringify(u.profile)}</td>
                <td>
                  <button
                    className="bg-green-600 px-2 py-1 rounded mr-2"
                    onClick={() =>
                      handleStatusChange('clients', u.user_id, 'approved')
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 px-2 py-1 rounded"
                    onClick={() =>
                      handleStatusChange('clients', u.user_id, 'rejected')
                    }
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      <h3>Pending Freelancers</h3>
      <table className="w-full text-white">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Profile</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(loading || freelancers.length === 0) ? (
            <tr>
              <td className="text-center italic" colSpan={3}>
                None
              </td>
            </tr>
          ) : (
            freelancers.map((u) => (
              <tr key={u.user_id}>
                <td>User ID: {u.user_id}</td>
                <td>Profile: {JSON.stringify(u.profile)}</td>
                <td>
                  <button
                    className="bg-green-600 px-2 py-1 rounded mr-2"
                    onClick={() =>
                      handleStatusChange('freelancers', u.user_id, 'approved')
                    }
                  >
                    Approve
                  </button>
                  <button
                    className="bg-red-600 px-2 py-1 rounded"
                    onClick={() =>
                      handleStatusChange('freelancers', u.user_id, 'rejected')
                    }
                  >
                    Reject
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}