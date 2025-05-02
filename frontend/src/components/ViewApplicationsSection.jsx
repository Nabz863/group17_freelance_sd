import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ projectId, onAssign }) {
  const [applications, setApplications] = useState([]);
  const [visible, setVisible]     = useState(true);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);

  useEffect(() => {
    const fetchApps = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from('applications')
          .select('*, applicant(*), freelancer(*)')
          .eq('projectid', projectId);
        if (err) throw err;
        setApplications(data || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching applications:', err);
        setError('Failed to load applications');
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, [projectId]);

  if (!visible) return null;
  if (loading) return <p>Loading applications…</p>;
  if (error)   return <p className="text-red-500">{error}</p>;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {applications.length === 0 ? (
        <p className="text-gray-400">No applications yet.</p>
      ) : (
        <div className="card-glow p-4 rounded-lg mb-6 bg-[#1a1a1a] border border-[#1abc9c]">
          <header className="flex justify-between items-center">
            <div>
              {applications[0].job_title ? (
                <h2 className="text-lg text-accent font-semibold">
                  {applications[0].job_title}
                </h2>
              ) : (
                <h2 className="text-lg text-accent font-semibold">
                  Applications
                </h2>
              )}
            </div>
            <button className="primary-btn" onClick={() => setVisible(false)}>
              Hide Applicants
            </button>
          </header>

          <ul className="mt-4 space-y-4">
            {applications.map((app) => {
              const person = app.freelancer || app.applicant;
              return (
                <li
                  key={app.applicationid || app.id}
                  className="p-3 rounded bg-[#222]"
                >
                  {person ? (
                    <>
                      <p className="text-white font-bold">
                        {(
                          person.firstName && person.lastName
                            ? `${person.firstName} ${person.lastName}`
                            : person.name
                        ) || 'Anonymous'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {person.profession || 'No profession listed'}
                      </p>
                      <p className="text-sm text-gray-400">
                        {person.email || 'No email provided'}
                      </p>
                      <button
                        className="primary-btn mt-2"
                        onClick={() => {
                          if (person.user_id) {
                            onAssign(person.user_id);
                          } else {
                            console.error('No user_id on this record');
                          }
                        }}
                      >
                        Assign Freelancer
                      </button>
                    </>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </section>
  );
}