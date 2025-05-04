import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ projectId, onAssign }) {
  const [applications, setApplications] = useState([]);
  const [profiles, setProfiles] = useState({});
  const [visible, setVisible] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // 1) get all applications for this project
        const { data: apps, error: appErr } = await supabase
          .from('applications')
          .select('applicationID, freelancerID, status, coverLetter')
          .eq('projectID', projectId);
        if (appErr) throw appErr;
        setApplications(apps || []);

        // 2) fetch each freelancer's profile
        const ids = [...new Set((apps || []).map(a => a.freelancerID))];
        if (ids.length) {
          const { data: frees, error: freeErr } = await supabase
            .from('freelancers')
            .select('user_id, profile')
            .in('user_id', ids);
          if (freeErr) throw freeErr;
          const map = {};
          frees.forEach(f => {
            try {
              map[f.user_id] = JSON.parse(f.profile);
            } catch {
              map[f.user_id] = {};
            }
          });
          setProfiles(map);
        }
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId]);

  if (!visible) return null;
  if (loading)   return <p>Loading applications…</p>;
  if (error)     return <p className="text-red-500">{error}</p>;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-400">No applications yet.</p>
      ) : (
        <div className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]">
          <header className="flex justify-between items-center">
            <h2 className="text-lg text-accent font-semibold">Applicants</h2>
            <button
              className="primary-btn"
              onClick={() => setVisible(false)}
            >
              Hide Applicants
            </button>
          </header>

          <ul className="mt-4 space-y-4">
            {applications.map(app => {
              const prof = profiles[app.freelancerID] || {};
              const name = [prof.firstName, prof.lastName].filter(Boolean).join(' ') || 'Anonymous';
              return (
                <li key={app.applicationID} className="p-3 rounded bg-[#222]">
                  <p className="text-white font-bold">{name}</p>
                  <p className="text-sm text-gray-400">
                    {prof.profession || 'No profession listed'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {prof.email || 'No email provided'}
                  </p>
                  <button
                    className="primary-btn mt-2"
                    onClick={() => onAssign(app.freelancerID)}
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
