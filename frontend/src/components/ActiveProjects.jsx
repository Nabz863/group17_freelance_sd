import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';
import DeliverableForm from './DeliverableForm';

export default function ActiveProjects() {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);

  useEffect(() => {
    if (!user?.sub) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // 1) Fetch active projects for this freelancer
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, description, completed, created_at, report')
          .eq('freelancer_id', user.sub)
          .eq('completed', false);
        if (projectError) throw projectError;

        // 2) For each project, fetch milestones and their deliverables
        const detailed = await Promise.all(
          projectData.map(async (project) => {
            // Parse JSON description
            let desc = project.description;
            if (typeof desc === 'string') {
              try { desc = JSON.parse(desc); } catch { desc = {}; }
            }

            // Fetch ordered milestones (with your new `number` column)
            const { data: msData, error: msError } = await supabase
              .from('milestones')
              .select('id, project_id, number, title, due_date, amount')
              .eq('project_id', project.id)
              .order('number', { ascending: true });
            if (msError) throw msError;

            // Fetch deliverables per milestone
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

            // Determine first incomplete milestone (no approved deliverable)
            const firstIncompleteIndex = milestones.findIndex(
              (ms) => !ms.deliverables.some((d) => d.status === 'approved')
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
    };

    fetchProjects();
  }, [user?.sub]);

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
    return (
      <p className="text-gray-400">
        No active projects. Apply for jobs in the Available Jobs section.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {projects.map((project) => {
        const { title, details } = project.description || {};
        return (
          <div
            key={project.id}
            className="card-glow p-5 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]"
          >
            {/* Project Header */}
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl text-accent font-bold mb-1">{title}</h2>
                <p className="text-sm text-gray-300 mb-2">{details}</p>
                <p className="text-xs text-gray-500">
                  Created: {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded-full text-xs ${
                  project.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-gray-100'
                }`}
              >
                {project.completed ? 'Completed' : 'In Progress'}
              </span>
            </div>

            {/* Project Report */}
            {project.report && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">
                  Project Report
                </h3>
                <p className="text-sm text-gray-400">{project.report}</p>
              </div>
            )}

            {/* Milestones */}
            {project.milestones.map((ms, idx) => (
              <div
                key={ms.id}
                className="card-glow p-4 rounded-lg bg-[#1a1a1a] border border-[#1abc9c] mb-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="text-sm font-semibold text-accent">
                      {ms.title}
                    </h4>
                    {ms.due_date && (
                      <span className="text-xs text-gray-500">
                        Due: {format(new Date(ms.due_date), 'MMM d, yyyy')}
                      </span>
                    )}
                  </div>
                  <span className="text-sm text-gray-500">${ms.amount}</span>
                </div>

                {/* Deliverables List */}
                {ms.deliverables.length > 0 && (
                  <div className="space-y-2 mb-2">
                    {ms.deliverables.map((d) => (
                      <div
                        key={d.id}
                        className="text-sm text-gray-400 p-2 rounded-lg bg-[#2a2a2a]"
                      >
                        <p className="mb-1">{d.description}</p>
                        <p className="text-xs text-gray-500">
                          Submitted: {format(new Date(d.submitted_at), 'MMM d, yyyy')}
                        </p>
                        {d.status !== 'pending' && (
                          <p className="text-xs">
                            Status:{' '}
                            <span
                              className={`font-semibold ${
                                d.status === 'approved'
                                  ? 'text-green-500'
                                  : 'text-red-500'
                              }`}
                            >
                              {d.status}
                            </span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Only allow submission on first incomplete milestone */}
                {idx === project.firstIncompleteIndex && (
                  <DeliverableForm
                    projectId={project.id}
                    milestone={ms}
                  />
                )}
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}
