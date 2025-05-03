import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ clientId, onAssign }) {
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [assigning, setAssigning] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      if (!clientId) {
        setError('Not signed in');
        setLoading(false);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('projects')
          .select(`
            id,
            description,
            applications (
              applicationid,
              freelancerid,
              status,
              freelancer:freelancerid (
                profile
              )
            )
          `)
          .eq('client_id', clientId);

        if (error) throw error;
        setJobs(data || []);
        setError(null);
      } catch (err) {
        console.error('Error loading applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [clientId]);

  const toggle = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const assign = async (projectId, freelancerId) => {
    setAssigning(projectId);
    await onAssign(projectId, freelancerId);
    setAssigning(null);
  };

  if (loading) return <p>Loading applications...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {jobs.length === 0 ? (
        <p className="text-gray-400">No jobs found.</p>
      ) : (
        jobs.map((job) => {
          let desc = {};
          if (typeof job.description === 'string') {
            try { desc = JSON.parse(job.description); }
            catch { desc = {}; }
          } else {
            desc = job.description || {};
          }

          return (
            <div
              key={job.id}
              className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]"
            >
              <header className="flex justify-between items-center">
                <div>
                  <h2 className="text-lg text-accent font-semibold">
                    {desc.title || 'Untitled Job'}
                  </h2>
                  <p className="text-gray-400 text-sm">
                    {desc.details || 'No description provided.'}
                  </p>
                </div>
                <button
                  className="primary-btn"
                  onClick={() => toggle(job.id)}
                >
                  {expanded[job.id] ? 'Hide Applicants' : 'View Applicants'}
                </button>
              </header>

              {expanded[job.id] && (
                <ul className="mt-4 space-y-4">
                  {job.applications.length === 0 ? (
                    <p className="text-gray-500 text-sm">
                      No applicants yet.
                    </p>
                  ) : (
                    job.applications.map((app) => {
                      let profile = {};
                      if (app.freelancer?.profile) {
                        try {
                          profile = JSON.parse(app.freelancer.profile);
                        } catch { profile = {}; }
                      }

                      const name = profile.full_name || 'Anonymous';
                      const title = profile.title || 'No title listed';

                      const busy = assigning === job.id;
                      return (
                        <li
                          key={app.applicationid}
                          className="p-3 rounded bg-[#222]"
                        >
                          <p className="text-white font-bold">{name}</p>
                          <p className="text-sm text-gray-400">{title}</p>
                          <button
                            className={`primary-btn mt-2 ${
                              busy ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            disabled={busy}
                            onClick={() =>
                              assign(job.id, app.freelancerid)
                            }
                          >
                            {busy ? 'Assigning…' : 'Assign Freelancer'}
                          </button>
                        </li>
                      );
                    })
                  )}
                </ul>
              )}
            </div>
          );
        })
      )}
    </section>
  );
}