// src/components/ViewApplicationsSection.jsx

import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';

export default function ViewApplicationsSection() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth0();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (authLoading || !isAuthenticated) return;

    const fetchApplications = async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('applications')
        .select(`
          applicationid,
          status,
          projects (
            projectid,
            description,
            completed
          )
        `)
        .eq('freelancerid', user.sub);

      if (fetchError) {
        setError(fetchError.message);
      } else {
        setApplications(data);
      }
      setLoading(false);
    };

    fetchApplications();
  }, [authLoading, isAuthenticated, user.sub]);

  if (authLoading || loading) {
    return <p className="text-white">Loading your applications…</p>;
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (applications.length === 0) {
    return <p className="text-white">You haven’t applied to any jobs yet.</p>;
  }

  return (
    <section aria-labelledby="applications-heading" className="p-4">
      <header>
        <h2 id="applications-heading" className="text-2xl font-semibold text-white mb-4">
          Your Applications
        </h2>
      </header>
      <ul role="list" className="space-y-4">
        {applications.map(({ applicationid, status, projects }) => (
          <li key={applicationid}>
            <article className="p-4 bg-gray-800 rounded-lg border border-green-600">
              <h3 className="text-xl font-medium text-green-400">
                {projects.description}
              </h3>
              <p className="text-white">Status: {status}</p>
              {projects.completed && (
                <p className="text-green-300">Project Completed</p>
              )}
            </article>
          </li>
        ))}
      </ul>
    </section>
  );
}
