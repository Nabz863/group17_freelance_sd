// src/components/ViewApplicationsSection.jsx
import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ projectId, onAssign }) {
  const [apps, setApps]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!projectId) {
      setApps([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    supabase
      .from('applications')
      // join to freelancers table via the foreign key relationship
      .select(`
        applicationid,
        coverLetter,
        status,
        freelancers (
          user_id,
          profile
        )
      `)
      .eq('projectid', projectId)
      .then(({ data, error: fetchError }) => {
        if (fetchError) throw fetchError;
        setApps(data || []);
      })
      .catch(err => {
        console.error('Error fetching applications:', err);
        setError(err.message || 'Failed to load applications');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [projectId]);

  if (!visible) return null;
  if (loading)   return <section className="dashboard-content"><p>Loading applications…</p></section>;
  if (error)     return <section className="dashboard-content"><p className="text-red-500">{error}</p></section>;

  return (
    <section className="dashboard-content">
      <h1>Job Applications</h1>

      {apps.length === 0 ? (
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
            {apps.map(app => {
              // supabase returns an array under "freelancers"
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
                    {[
                      profile.firstName,
                      profile.lastName
                    ].filter(Boolean).join(' ') || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.profession || 'No profession listed'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.specialization
                      ? `Specialization: ${profile.specialization}`
                      : ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.experience
                      ? `Experience: ${profile.experience} yrs`
                      : ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.hourly_rate
                      ? `Rate: ${profile.hourly_rate}`
                      : ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.location || ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.availability || ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.phone || ''}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.email || 'No email provided'}
                  </p>
                  {profile.portfolio_url && (
                    <p className="text-sm text-accent underline">
                      <a href={profile.portfolio_url} target="_blank" rel="noreferrer">
                        Portfolio
                      </a>
                    </p>
                  )}
                  {/* CV/download link if you store it under profile.cv_url */}
                  {profile.cv_url && (
                    <button
                      className="primary-btn mt-2"
                      onClick={() => window.open(profile.cv_url, '_blank')}
                    >
                      View CV
                    </button>
                  )}
                  <button
                    className="primary-btn mt-2"
                    onClick={() => onAssign(fl.user_id)}
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