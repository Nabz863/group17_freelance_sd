import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const navigate = useNavigate();

  const fetchPending = async () => {
    const token = localStorage.getItem('auth_token');
    const [{ data: fData }, { data: cData }] = await Promise.all([
      axios.get('/api/users?role=freelancer&status=pending', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/users?role=client&status=pending', { headers: { Authorization: `Bearer ${token}` } })
    ]);
    setPending([
      ...fData.users.map(u => ({ ...u, role: 'freelancer' })),
      ...cData.users.map(u => ({ ...u, role: 'client' }))
    ]);
  };

  useEffect(() => {
    fetchPending();
  }, []);

  const handleDecision = async (userId, role, decision) => {
    const token = localStorage.getItem('auth_token');
    await axios.patch(
      `/api/users/${userId}/status`,
      { role, status: decision },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    fetchPending();
  };

  return (
    <div className="p-8 text-white">
      <h1>Admin: Pending Profile Approvals</h1>
      <table className="w-full mt-4">
        <thead>
          <tr>
            <th>User ID</th>
            <th>Role</th>
            <th>View CV</th>
            <th>Approve / Reject</th>
          </tr>
        </thead>
        <tbody>
          {pending.map(u => (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>{u.role}</td>
              <td>
                <button
                  onClick={() =>
                    navigate(`/admin/users/${u.user_id}/profile/pdf?type=${u.role}`)
                  }
                  className="underline"
                >
                  View CV
                </button>
              </td>
              <td>
                <button
                  onClick={() => handleDecision(u.user_id, u.role, 'approved')}
                  className="mr-2 bg-green-600 px-2 rounded"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleDecision(u.user_id, u.role, 'rejected')}
                  className="bg-red-600 px-2 rounded"
                >
                  Reject
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}