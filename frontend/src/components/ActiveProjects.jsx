import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';
import DeliverableForm from './DeliverableForm';

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

      // 1) Load in-progress projects for client or freelancer
      let q = supabase
        .from('projects')
        .select('id, description, completed, created_at, report')
        .eq('completed', false);

      if (isClient) q = q.eq('client_id', user.sub);
      else          q = q.eq('freelancer_id', user.sub);

      const { data: projectData, error: projectError } = await q;
      if (projectError) throw projectError;

      // 2) Load milestones & deliverables for each project
      const detailed = await Promise.all(
        projectData.map(async (project) => {
          // parse JSON description
          let desc = project.description;
          if (typeof desc === 'string') {
            try { desc = JSON.parse(desc); } catch { desc = {}; }
          }

          // fetch ordered milestones
          const { data: msData, error: msError } = await supabase
            .from('milestones')
            .select('id, project_id, number, title, due_date, amount')
            .eq('project_id', project.id)
            .order('number', { ascending: true });
          if (msError) throw msError;

          // fetch deliverables for each milestone
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

          // find first incomplete milestone (no deliverable approved)
          const firstIncompleteIndex = milestones.findIndex(ms =>
            !ms.deliverables.some(d => d.status === 'approved')
          );

          return {
            ...project,
            description: desc,
            milestones,
            firstIncompleteIndex
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
        .update({ status: 'approved', approved_at: new Date().toISOString() })
        .eq('id', deliverableId);
      fetchProjects();
    } catch (err) {
      console.error('Error approving deliverable:', err);
    }
  };

  const handleReject = async (deliverableId) => {
    const comments = revisionComments[deliverableId] || '';
    try {
      await supabase
        .from('deliverables')
        .update({ status: 'revision_requested', revision_comments: comments })
        .eq('id', deliverableId);
      setRevisionComments(prev => ({ ...prev, [deliverableId]: '' }));
      fetchProjects();
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
  if (error) {
    return <p className="text-red-500">{error}</p>;
  }
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

            {/* Project Report */}
            {project.report && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">Project Report</h3>
                <p className="text-sm text-gray-400">{project.report}</p>
              </div>
            )}

            {/* Milestones & Deliverables */}
            {project.milestones.map((ms, idx) => (
              <div key={ms.id} className="mb-4 p-4 bg-[#1a1a1a] border border-[#1abc9c] rounded-lg">
                <div className="flex justify-between mb-2">
                  <h4 className="text-sm font-semibold text-accent">{ms.title}</h4>
                  <span className="text-sm text-gray-500">${ms.amount}</span>
                </div>
                {ms.due_date && (
                  <p className="text-xs text-gray-500 mb-2">
                    Due: {format(new Date(ms.due_date), 'MMM d, yyyy')}
                  </p>
                )}

                {/* list of deliverables */}
                {ms.deliverables.map(d => (
                  <div key={d.id} className="mb-3 p-2 bg-[#2a2a2a] rounded text-sm text-gray-200">
                    <p className="mb-1">{d.description}</p>
                    <p className="text-xs text-gray-400 mb-1">
                      Submitted: {format(new Date(d.submitted_at), 'MMM d, yyyy')}
                    </p>

                    {isClient ? (
                      d.status === 'pending' ? (
                        <div className="space-y-2">
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
                          </div>
                          <textarea
                            className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                            rows={2}
                            placeholder="Revision comments…"
                            value={revisionComments[d.id] || ''}
                            onChange={e =>
                              setRevisionComments(prev => ({ ...prev, [d.id]: e.target.value }))
                            }
                          />
                        </div>
                      ) : (
                        <p className="text-xs">
                          Status:{' '}
                          <span
                            className={`font-semibold ${
                              d.status === 'approved' ? 'text-green-400' : 'text-red-400'
                            }`}
                          >
                            {d.status.replace('_', ' ')}
                          </span>
                        </p>
                      )
                    ) : (
                      // freelancer sees status only
                      <p className="text-xs">
                        Status:{' '}
                        <span
                          className={`font-semibold ${
                            d.status === 'approved' ? 'text-green-400' :
                            d.status === 'revision_requested' ? 'text-red-400' :
                            'text-gray-400'
                          }`}
                        >
                          {d.status.replace('_', ' ')}
                        </span>
                      </p>
                    )}
                  </div>
                ))}

                {/* deliverable form only for freelancer AND only on first incomplete milestone */}
                {!isClient && idx === project.firstIncompleteIndex && (
                  <DeliverableForm projectId={project.id} milestone={ms} />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
