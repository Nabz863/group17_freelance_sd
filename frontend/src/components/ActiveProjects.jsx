import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';
import DeliverableForm from './DeliverableForm';
import ClientDeliverableApproval from './ClientDeliverableApproval';
import FreelancerDeliverableUpdate from './FreelancerDeliverableUpdate';
import ClientCompletionTracking from './ClientCompletionTracking';

export default function ActiveProjects({ isClient = false }) {
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

        // 1) Fetch all in-progress projects for this freelancer
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, description, client_id, completed, created_at, report')
          .eq('freelancer_id', user.sub)
          .eq('completed', false);
        if (projectError) throw projectError;

        // 2) For each project, fetch its milestones & deliverables
        const projectPromises = projectData.map(async (project) => {
          // Fetch milestones (no milestone_number column in schema)
          const { data: milestoneData, error: milestoneError } = await supabase
            .from('milestones')
            .select('id, project_id, title, due_date, amount')
            .eq('project_id', project.id);
          if (milestoneError) throw milestoneError;

          // Attach deliverables to each milestone
          const milestonesWithDeliverables = await Promise.all(
            milestoneData.map(async (ms) => {
              // Fetch deliverables by matching milestone_id
              const { data: deliverables, error: dErr } = await supabase
                .from('deliverables')
                .select('*')
                .eq('contract_id', project.id)
                .eq('milestone_id', ms.id);
              if (dErr) throw dErr;

              // If client, fetch freelancer name
              const withNames = await Promise.all(
                deliverables.map(async (d) => {
                  if (!isClient || !d.submitted_by) return d;
                  const { data: f, error: fErr } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', d.submitted_by)
                    .single();
                  if (fErr) throw fErr;
                  return { ...d, freelancer_name: f?.name };
                })
              );

              return { ...ms, deliverables: withNames };
            })
          );

          return { ...project, milestones: milestonesWithDeliverables };
        });

        const result = await Promise.all(projectPromises);

        // Parse project.description JSON
        const parsed = result.map((p) => {
          let desc = p.description;
          if (typeof desc === 'string') {
            try { desc = JSON.parse(desc); } catch { desc = {}; }
          }
          return { ...p, description: desc };
        });

        setProjects(parsed);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load active projects.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.sub, isClient]);

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
                {project.client_id && (
                  <p className="text-sm text-gray-500">
                    Client ID: {project.client_id}
                  </p>
                )}
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

            {/* Report */}
            {project.report && (
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">
                  Project Report
                </h3>
                <p className="text-sm text-gray-400">{project.report}</p>
              </div>
            )}

            {/* Client-specific */}
            {isClient && (
              <ClientCompletionTracking
                projectId={project.id}
                milestones={project.milestones}
              />
            )}

            {/* Milestones & Deliverables */}
            {project.milestones.map((ms) => (
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

                {ms.deliverables.map((d) => (
                  <div
                    key={d.id}
                    className="text-sm text-gray-400 p-2 rounded-lg bg-[#2a2a2a] mb-2"
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
                              : d.status === 'revision_requested'
                              ? 'text-red-500'
                              : 'text-gray-500'
                          }`}
                        >
                          {d.status}
                        </span>
                      </p>
                    )}
                    {isClient && d.submitted_by && (
                      <p className="text-xs text-gray-500">
                        Submitted by: {d.freelancer_name || 'Freelancer'}
                      </p>
                    )}
                    {!isClient && d.status === 'revision_requested' && (
                      <FreelancerDeliverableUpdate deliverable={d} />
                    )}
                    {isClient && d.status === 'pending' && (
                      <ClientDeliverableApproval
                        deliverable={d}
                        projectId={project.id}
                      />
                    )}
                    {isClient && d.approved_at && (
                      <p className="text-xs text-gray-500">
                        Approved: {format(new Date(d.approved_at), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                ))}

                {/* New deliverable form */}
                {!isClient && (
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
