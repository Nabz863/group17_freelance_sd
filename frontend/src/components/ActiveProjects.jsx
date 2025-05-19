// src/components/ActiveProjects.jsx

import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';

export default function ActiveProjects({ isClient = false }) {
  const { user } = useAuth0();
  const [projects, setProjects]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [revisionComments, setRevisionComments] = useState({});

  const fetchProjects = useCallback(async () => {
    if (!user?.sub) return;
    try {
      setLoading(true);
      setError(null);

      // Fetch active projects: for client use client_id, for freelancer freelancer_id
      const projQuery = supabase
        .from('projects')
        .select('id, description, completed, created_at, report');
      if (isClient) projQuery.eq('client_id', user.sub);
      else          projQuery.eq('freelancer_id', user.sub);
      projQuery.eq('completed', false);

      const { data: projectData, error: projectError } = await projQuery;
      if (projectError) throw projectError;

      const detailed = await Promise.all(
        projectData.map(async (project) => {
          // Parse JSON description
          let desc = project.description;
          if (typeof desc === 'string') {
            try { desc = JSON.parse(desc); } catch { desc = {}; }
          }

          // Fetch milestones, ordered by number
          const { data: msData, error: msError } = await supabase
            .from('milestones')
            .select('id, project_id, number, title, due_date, amount')
            .eq('project_id', project.id)
            .order('number', { ascending: true });
          if (msError) throw msError;

          // For each milestone, fetch deliverables
          const milestones = await Promise.all(
            msData.map(async (ms) => {
              const { data: delivs, error: dErr } = await supabase
                .from('deliverables')
                .select('*')
                .eq('project_id', project.id)
                .eq('milestone_number', ms.number)
                .order('submitted_at', { ascending: true });
              if (dErr) throw dErr;
              return { ...ms, deliverables: delivs };
            })
          );

          return { 
            ...project, 
            description: desc, 
            milestones 
          };
        })
      );

      setProjects(detailed);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError('Failed to load active projects.');
    } finally {
      setLoading(false);
    }
  }, [user?.sub, isClient]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleApprove = async (deliverableId) => {
    try {
      await supabase
        .from('deliverables')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('id', deliverableId);
      await fetchProjects();
    } catch (err) {
      console.error('Error approving deliverable:', err);
    }
  };

  const handleReject = async (deliverableId) => {
    const comments = revisionComments[deliverableId] || '';
    try {
      await supabase
        .from('deliverables')
        .update({
          status: 'revision_requested',
          revision_comments: comments
        })
        .eq('id', deliverableId);
      setRevisionComments(prev => ({ ...prev, [deliverableId]: '' }));
      await fetchProjects();
    } catch (err) {
      console.error('Error rejecting deliverable:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1abc9c]" />
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;
  if (!projects.length) {
    return <p className="text-gray-400">No active projects.</p>;
  }

  return (
    <div className="space-y-6">
      {projects.map(project => {
        const { title, details } = project.description || {};
        return (
          <div key={project.id} className="card-glow p-5 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]">
            {/* Project Header */}
            <div className="flex justify-between mb-4">
              <div>
                <h2 className="text-xl text-accent font-bold">{title}</h2>
                <p className="text-sm text-gray-300">{details}</p>
                <p className="text-xs text-gray-500">
                  Created: {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs rounded-full ${
                project.completed ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-100'
              }`}>
                {project.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* Milestones & Deliverables */}
            {project.milestones.map(ms => (
              <div key={ms.id} className="mb-4 p-4 bg-[#1a1a1a] border border-[#1abc9c] rounded-lg">
                <div className="flex justify-between mb-2">
                  <h3 className="text-sm font-semibold text-accent">{ms.title}</h3>
                  <span className="text-sm text-gray-500">${ms.amount}</span>
                </div>
                {ms.due_date && (
                  <p className="text-xs text-gray-500 mb-2">
                    Due: {format(new Date(ms.due_date), 'MMM d, yyyy')}
                  </p>
                )}

                {ms.deliverables.length === 0 && (
                  <p className="text-gray-400">No deliverables submitted yet.</p>
                )}

                {ms.deliverables.map(d => (
                  <div key={d.id} className="mb-3 p-2 bg-[#2a2a2a] rounded text-sm text-gray-200">
                    <p className="mb-1">{d.description}</p>
                    <p className="text-xs text-gray-400 mb-1">
                      Submitted: {format(new Date(d.submitted_at), 'MMM d, yyyy')}
                    </p>
                    {d.status === 'pending' && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleApprove(d.id)}
                          className="px-3 py-1 bg-green-500 rounded text-black text-xs"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleReject(d.id)}
                          className="px-3 py-1 bg-red-500 rounded text-white text-xs"
                        >
                          Reject
                        </button>
                        <textarea
                          className="w-full mt-2 p-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                          rows={2}
                          placeholder="Revision comments…"
                          value={revisionComments[d.id] || ''}
                          onChange={e =>
                            setRevisionComments(prev => ({ ...prev, [d.id]: e.target.value }))
                          }
                        />
                      </div>
                    )}
                    {d.status !== 'pending' && (
                      <p className="text-xs">
                        Status:{' '}
                        <span className={`font-semibold ${
                          d.status === 'approved' ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {d.status.replace('_', ' ')}
                        </span>
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
