import React from "react";

export default function UserApprovalPanel({ users, onApprove, onReject }) {
  return (
    <table className="w-full text-white">
      <thead>
        <tr>
          <th>User ID</th>
          <th>Profile</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => {
          const profile = u.profile;
          const link =
            typeof profile === "string"
              ? profile
              : null;
          return (
            <tr key={u.user_id}>
              <td>{u.user_id}</td>
              <td>
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    View PDF
                  </a>
                ) : (
                  "No PDF"
                )}
              </td>
              <td>
                <button
                  className="bg-green-600 px-2 mr-2 rounded"
                  onClick={() => onApprove(u.user_id)}
                >
                  Approve
                </button>
                <button
                  className="bg-red-600 px-2 rounded"
                  onClick={() => onReject(u.user_id)}
                >
                  Reject
                </button>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}