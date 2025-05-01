import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ jobId, onAssign }) {
  const [applications, setApplications] = useState([]);
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    setLoading(true);
    const fetchApps = async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*, applicant(*)')
        .eq('job_id', jobId);

      if (error) {
        console.error('Error fetching applications:', error);
        setApplications([]);
      } else {
        setApplications(data || []);
      }
      setLoading(false);
    };

    fetchApps();
  }, [jobId]);

  if (!visible) return null;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {loading ? (
        <p className="animate-pulse text-white">Loading applications…</p>
      ) : applications.length === 0 ? (
        <p className="mt-4 italic text-white">No applications yet.</p>
      ) : (
        <div className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]">
          <header className="flex justify-between items-center">
            <div>
              <h2 className="text-lg text-accent font-semibold">
                {applications[0].job_title}
              </h2>
              {applications[0].job_description && (
                <p className="text-gray-400 text-sm">
                  {applications[0].job_description}
                </p>
              )}
            </div>
            <button
              className="primary-btn"
              onClick={() => setVisible(false)}
            >
              Hide Applicants
            </button>
          </header>

          <ul className="mt-4 space-y-4">
            {applications.map((app) => (
              <li
                key={app.id}
                className="p-3 rounded bg-[#222]"
              >
                <p className="text-white font-bold">
                  {app.applicant.firstName} {app.applicant.lastName}
                </p>
                {app.applicant.profession && (
                  <p className="text-sm text-gray-400">
                    {app.applicant.profession}
                  </p>
                )}
                {app.applicant.email && (
                  <p className="text-sm text-gray-400">
                    {app.applicant.email}
                  </p>
                )}
                <button
                  className="primary-btn mt-2"
                  onClick={() => onAssign(app.applicant.user_id)}
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