import React, { useEffect, useState, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';
import DeliverableForm from './DeliverableForm';

export default function ActiveProjects({ isClient = false }) {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.sub) return;
    try {
      setLoading(true);
      setError(null);

        // First get all projects where the freelancer is selected
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, description, client_id, completed, created_at, report')
          .eq('freelancer_id', user.sub)
          .eq('completed', false);

      if (isClient) q = q.eq('client_id', user.sub);
      else          q = q.eq('freelancer_id', user.sub);

      const { data: projectData, error: projectError } = await q;
      if (projectError) throw projectError;

        // Get milestones and deliverables for each project
        const projectPromises = projectData.map(async (project) => {
          const { data: milestoneData, error: milestoneError } = await supabase
            .from('milestones')
            .select('id, project_id, number, title, due_date, amount')
            .eq('project_id', project.id)
            .order('number', { ascending: true });
          if (msError) throw msError;

          // Get deliverables for each milestone
          const milestonesWithDeliverables = await Promise.all(
            milestoneData.map(async (milestone) => {
              const { data: deliverables, error: deliverablesError } = await supabase
                .from('deliverables')
                .select('*')
                .eq('contract_id', project.id)
                .eq('milestone_number', milestone.number);

              if (deliverablesError) throw deliverablesError;

              // For clients, fetch the freelancer's name
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
            milestones: milestonesWithDeliverables 
          };
        });

        const projectsWithMilestones = await Promise.all(projectPromises);
        
        // Parse description if it's a string
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

        // Filter out completed projects for freelancers
        const filteredProjects = isClient ? parsedProjects : parsedProjects.filter(p => !p.completed);

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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1abc9c]"></div>
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
      {projects.map((project) => {
        const { title, details } = project.description || {};
        return (
          <div key={project.id} className="card-glow p-5 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]">
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
              <div className="flex items-center">
                <span className={`px-2 py-1 rounded-full text-xs ${
                  project.completed ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-100'
                }`}>
                  {project.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
            </div>
            {project.report && (
              <section className="mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">
                  Project Report
                </h3>
                <p className="text-sm text-gray-400">{project.report}</p>
              </section>
            )}

            {isClient && (
              <ClientCompletionTracking 
                projectId={project.id} 
                milestones={project.milestones}
              />
            )}

            {project.milestones?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-accent mb-2">Milestones</h3>
                {project.milestones.map((milestone) => (
                  <div key={milestone.id} className="card-glow p-4 rounded-lg bg-[#1a1a1a] border border-[#1abc9c] mb-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="text-sm font-semibold text-accent">{milestone.title}</h4>
                        {milestone.due_date && (
                          <span className="text-xs text-gray-500">
                            Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                          </span>
                        )}
                      </div>
                      <span className="text-sm text-gray-500">
                        ${milestone.amount}
                      </span>
                    </div>

                    {milestone.deliverables.length > 0 && (
                      <div className="mt-2">
                        <h4 className="text-xs font-semibold text-accent mb-1">Deliverables</h4>
                        <div className="space-y-2">
                          {milestone.deliverables.map((deliverable) => (
                            <div key={deliverable.id} className="text-sm text-gray-400 p-2 rounded-lg bg-[#2a2a2a]">
                              <div className="flex justify-between items-start">
                                <div>
                                  <p className="mb-1">{deliverable.description}</p>
                                  <p className="text-xs text-gray-500">
                                    Submitted: {format(new Date(deliverable.submitted_at), 'MMM d, yyyy')}
                                  </p>
                                  {deliverable.status !== 'pending' && (
                                    <p className="text-xs">
                                      Status: <span className={`font-semibold ${
                                        deliverable.status === 'approved' ? 'text-green-500' :
                                        deliverable.status === 'revision_requested' ? 'text-red-500' :
                                        'text-gray-500'
                                      }`}>
                                        {deliverable.status}
                                      </span>
                                    </p>
                                  )}
                                  {deliverable.revision_comments && (
                                    <p className="text-xs text-red-500 mt-1">
                                      Revision Comments: {deliverable.revision_comments}
                                    </p>
                                  )}
                                  {isClient && deliverable.submitted_by && (
                                    <p className="text-xs text-gray-500">
                                      Submitted by: {deliverable.freelancer_name || 'Freelancer'}
                                    </p>
                                  )}
                                </div>
                                {deliverable.approved_at && (
                                  <p className="text-xs text-gray-500">
                                    Approved: {format(new Date(deliverable.approved_at), 'MMM d, yyyy')}
                                  </p>
                                )}
                              </div>
                              {isClient && deliverable.status === 'pending' && (
                                <ClientDeliverableApproval deliverable={deliverable} projectId={project.id} />
                              )}
                              {!isClient && deliverable.status === 'revision_requested' && (
                                <FreelancerDeliverableUpdate deliverable={deliverable} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {!isClient && (
                      <DeliverableForm projectId={project.id} milestone={milestone} />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
