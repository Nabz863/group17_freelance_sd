// src/components/ViewApplicationsSection.jsx
import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ projectId, onAssign }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState(null);
  const [visible, setVisible]           = useState(true);

  useEffect(() => {
    async function fetchApps() {
      if (!projectId) {
        setApplications([]);
        setLoading(false);
        return;
      }
      setError(null);
      setLoading(true);

      try {
        // Join against your "freelancers" table
        const { data, error: fetchError } = await supabase
          .from('applications')
          .select('*, freelancers(*)')
          .eq('projectid', projectId);

        if (fetchError) throw fetchError;
        setApplications(data || []);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to load applications');
      } finally {
        setLoading(false);
      }
    }

    fetchApps();
  }, [projectId]);

  if (!visible) return null;
  if (loading)   return <section className="dashboard-content"><p>Loading applications…</p></section>;
  if (error)     return <section className="dashboard-content"><p className="text-red-500">{error}</p></section>;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-400">No applications yet.</p>
      ) : (
        <div className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]">
          <header className="flex justify-between items-center">
            <h2 className="text-lg text-accent font-semibold">Applications</h2>
            <button className="primary-btn" onClick={() => setVisible(false)}>
              Hide Applicants
            </button>
          </header>

          <ul className="mt-4 space-y-4">
            {applications.map(app => {
              // supabase returns `freelancers` as an array
              const fl = app.freelancers?.[0] || {};
              let profile = {};
              if (fl.profile) {
                try {
                  profile = typeof fl.profile === 'string'
                    ? JSON.parse(fl.profile)
                    : fl.profile;
                } catch {
                  profile = {};
                }
              }

              return (
                <li key={app.applicationid} className="p-3 rounded bg-[#222]">
                  <p className="text-white font-bold">
                    {[profile.firstName, profile.lastName].filter(Boolean).join(' ')}
                  </p>
                  <p className="text-sm text-gray-400">{profile.profession || 'No profession listed'}</p>
                  <p className="text-sm text-gray-400">{profile.email      || 'No email provided'}</p>
                  <button
                    className="primary-btn mt-2"
                    onClick={() => onAssign(app.freelancerid)}
                  >
                    Assign Freelancer
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}