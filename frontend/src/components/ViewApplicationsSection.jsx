import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ clientId, onAssign }) {
  const [jobs, setJobs] = useState([]);
  const [expanded, setExpanded] = useState({});
  const [assigningJob, setAssigningJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
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
    load();
  }, [clientId]);

  if (loading) return <p>Loading applications…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  const toggle = (jobId) =>
    setExpanded((prev) => ({ ...prev, [jobId]: !prev[jobId] }));

  const assign = async (jobId, freelancerId) => {
    setAssigningJob(jobId);
    await onAssign(jobId, freelancerId);
    setAssigningJob(null);
  };

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
                      let prof = {};
                      if (app.freelancer?.profile) {
                        try {
                          prof = JSON.parse(app.freelancer.profile);
                        } catch {
                          prof = {};
                        }
                      }

                      const name       = `${prof.firstName || ''} ${prof.lastName || ''}`.trim() || 'Anonymous';
                      const profession = prof.profession || 'No profession listed';

                      const busy = assigningJob === job.id;

                      return (
                        <li
                          key={app.applicationid}
                          className="p-3 rounded bg-[#222]"
                        >
                          <p className="text-white font-bold">{name}</p>
                          <p className="text-sm text-gray-400">
                            {profession}
                          </p>
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