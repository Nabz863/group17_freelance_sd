import React from "react";

export default function PendingApproval() {
  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-center p-8">
      <h1 className="text-2xl font-bold mb-4 text-red-500">Approval Pending</h1>
      <p className="text-gray-700">
        Your account is pending approval from an administrator.
      </p>
      <p className="text-sm mt-2 text-gray-500">
        Please check back later. You’ll be notified once your account is activated.
      </p>
    </section>
  );
}