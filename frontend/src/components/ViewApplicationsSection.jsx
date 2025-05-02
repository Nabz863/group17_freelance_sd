import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ projectId, onAssign }) {
  const [applications, setApplications] = useState([]);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, applicant(*)')
        .eq('projectid', projectId);

      if (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } else {
        setApplications(data || []);
      }
    };
    fetchApps();
  }, [projectId]);

  if (!visible) return null;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-400">No applications yet.</p>
      ) : (
        <div className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]">
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-lg text-accent font-semibold">
                {applications[0].job_title}
              </h2>
              <p className="text-gray-400 text-sm">
                {applications[0].job_location}
              </p>
            </div>
            <button
              className="primary-btn"
              onClick={() => setVisible(false)}
            >
              Hide Applicants
            </button>
          </header>

          <ul className="mt-4 space-y-4">
            {applications.map((u) => (
              <li key={u.id} className="p-3 rounded bg-[#222]">
                <p className="text-white font-bold">
                  {u.applicant.firstName} {u.applicant.lastName}
                </p>
                <p className="text-sm text-gray-400">
                  {u.applicant.profession}
                </p>
                <p className="text-sm text-gray-400">
                  {u.applicant.email}
                </p>
                <button
                  className="primary-btn mt-2"
                  onClick={() => onAssign(u.applicant.user_id)}
                >
                  Assign Freelancer
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}