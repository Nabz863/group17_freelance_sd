import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';
import DeliverableForm from './DeliverableForm';

export default function ActiveProjects({ isClient = false }) {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [revisionComments, setRevisionComments] = useState({});

  useEffect(() => {
    if (!user?.sub) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, description, client_id, completed, created_at, report')
          .eq('freelancer_id', user.sub)
          .eq('completed', false);

        if (projectError) throw projectError;

        const projectPromises = projectData.map(async (project) => {
          const { data: milestoneData, error: milestoneError } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', project.id);

          if (milestoneError) throw milestoneError;

          const milestonesWithDeliverables = await Promise.all(
            milestoneData.map(async (milestone) => {
              const { data: deliverables, error: deliverablesError } = await supabase
                .from('deliverables')
                .select('*')
                .eq('contract_id', project.id)
                .eq('milestone_number', milestone.number);

              if (deliverablesError) throw deliverablesError;

              const deliverablesWithFreelancer = await Promise.all(
                deliverables.map(async (deliverable) => {
                  if (!isClient || !deliverable.submitted_by) return deliverable;

                  const { data: freelancer, error: freelancerError } = await supabase
                    .from('users')
                    .select('name')
                    .eq('id', deliverable.submitted_by)
                    .single();

                  if (freelancerError) throw freelancerError;

                  return { ...deliverable, freelancer_name: freelancer?.name };
                })
              );

              return { ...milestone, deliverables: deliverablesWithFreelancer };
            })
          );

          return {
            ...project,
            milestones: milestonesWithDeliverables,
          };
        });

        const projectsWithMilestones = await Promise.all(projectPromises);

        const parsedProjects = projectsWithMilestones.map((p) => {
          let desc = p.description;
          if (typeof desc === 'string') {
            try {
              desc = JSON.parse(desc);
            } catch {
              desc = {};
            }
          }
          return { ...p, description: desc };
        });

        const filteredProjects = isClient
          ? parsedProjects
          : parsedProjects.filter((p) => !p.completed);

        setProjects(filteredProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load active projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.sub, isClient]);

  if (loading) {
    return (
      <section className="flex items-center justify-center h-full">
        <section className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1abc9c]" />
      </section>
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
    <section className="space-y-6">
      {projects.map((project) => {
        const { title, details } = project.description || {};
        return (
          <section
            key={project.id}
            className="card-glow p-5 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]"
          >
            {/* Project Header */}
            <section className="flex justify-between mb-4">
              <section>
                <h2 className="text-xl text-accent font-bold">{title}</h2>
                <p className="text-sm text-gray-300">{details}</p>
                <p className="text-xs text-gray-500">
                  Created: {format(new Date(project.created_at), 'MMM d, yyyy')}
                </p>
              </section>
              <p
                className={`px-2 py-1 text-xs rounded-full ${
                  project.completed
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-gray-100'
                }`}
              >
                {project.completed ? 'Completed' : 'In Progress'}
              </p>
            </section>

            {/* Project Report */}
            {project.report && (
              <section className="mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">
                  Project Report
                </h3>
                <p className="text-sm text-gray-400">{project.report}</p>
              </section>
            )}

            {/* Milestones & Deliverables */}
            {project.milestones.map((ms, idx) => (
              <section
                key={ms.id}
                className="mb-4 p-4 bg-[#1a1a1a] border border-[#1abc9c] rounded-lg"
              >
                <section className="flex justify-between mb-2">
                  <h4 className="text-sm font-semibold text-accent">
                    {ms.title}
                  </h4>
                  <p className="text-sm text-gray-500">${ms.amount}</p>
                </section>
                {ms.due_date && (
                  <p className="text-xs text-gray-500 mb-2">
                    Due: {format(new Date(ms.due_date), 'MMM d, yyyy')}
                  </p>
                )}

                {/* list of deliverables */}
                {ms.deliverables.map((d) => (
                  <section
                    key={d.id}
                    className="mb-3 p-2 bg-[#2a2a2a] rounded text-sm text-gray-200"
                  >
                    <p className="mb-1">{d.description}</p>
                    <p className="text-xs text-gray-400 mb-1">
                      Submitted: {format(new Date(d.submitted_at), 'MMM d, yyyy')}
                    </p>

                    {isClient ? (
                      d.status === 'pending' ? (
                        <section className="space-y-2">
                          <section className="space-x-2">
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
                          </section>
                          <textarea
                            className="w-full p-1 bg-gray-800 border border-gray-700 rounded text-xs text-white"
                            rows={2}
                            placeholder="Revision comments…"
                            value={revisionComments[d.id] || ''}
                            onChange={(e) =>
                              setRevisionComments((prev) => ({
                                ...prev,
                                [d.id]: e.target.value,
                              }))
                            }
                          />
                        </section>
                      ) : (
                        <p className="text-xs">
                          Status:{' '}
                          <strong
                            className={`font-semibold ${
                              d.status === 'approved'
                                ? 'text-green-400'
                                : 'text-red-400'
                            }`}
                          >
                            {d.status.replace('_', ' ')}
                          </strong>
                        </p>
                      )
                    ) : (
                      <p className="text-xs">
                        Status:{' '}
                        <strong
                          className={`font-semibold ${
                            d.status === 'approved'
                              ? 'text-green-400'
                              : d.status === 'revision_requested'
                              ? 'text-red-400'
                              : 'text-gray-400'
                          }`}
                        >
                          {d.status.replace('_', ' ')}
                        </strong>
                      </p>
                    )}
                  </section>
                ))}

                {!isClient && idx === project.firstIncompleteIndex && (
                  <DeliverableForm projectId={project.id} milestone={ms} />
                )}
              </section>
            ))}
          </section>
        );
      })}
    </section>
  );
}
