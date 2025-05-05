// src/components/ViewApplicationsSection.jsx
import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection({ projectId, onAssign }) {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState(null);
  const [visible, setVisible]       = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      if (!projectId) {
        setApplications([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('applications')
          .select('*, freelancers(*)')
          .eq('projectid', projectId);

        if (fetchError) throw fetchError;
        setApplications(data || []);
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
              // supabase embeds an array named "freelancers"
              const arr = app.freelancers || [];
              const fl  = arr[0] || {};
              let profile = {};

              // profile stored as JSON string or object
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
                      profile.firstName || profile.fullName,
                      profile.lastName
                    ].filter(Boolean).join(' ') || 'Anonymous'}
                  </p>
                  <p className="text-sm text-gray-400">
                    {profile.profession || 'No profession listed'}
                  </p>
                  {profile.specialization && (
                    <p className="text-sm text-gray-400">
                      Specialization: {profile.specialization}
                    </p>
                  )}
                  {profile.experience && (
                    <p className="text-sm text-gray-400">
                      Experience: {profile.experience} yrs
                    </p>
                  )}
                  {profile.skills && (
                    <p className="text-sm text-gray-400">
                      Skills: {profile.skills}
                    </p>
                  )}
                  {profile.hourly_rate && (
                    <p className="text-sm text-gray-400">
                      Rate: {profile.hourly_rate}
                    </p>
                  )}
                  {profile.location && (
                    <p className="text-sm text-gray-400">
                      Location: {profile.location}
                    </p>
                  )}
                  {profile.availability && (
                    <p className="text-sm text-gray-400">
                      Availability: {profile.availability}
                    </p>
                  )}
                  {profile.phone && (
                    <p className="text-sm text-gray-400">
                      Phone: {profile.phone}
                    </p>
                  )}
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
