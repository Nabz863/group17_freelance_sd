import React, { useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { format } from 'date-fns';

export default function ActiveProjects() {
  const { user } = useAuth0();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.sub) return;

    const fetchProjects = async () => {
      try {
        setLoading(true);
        setError(null);

        // First get all projects where the freelancer is selected
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('id, description, client_id, completed, created_at, report')
          .eq('freelancer_id', user.sub)
          .eq('completed', false);

        if (projectError) throw projectError;

        // Get milestones for each project
        const projectPromises = projectData.map(async (project) => {
          const { data: milestoneData, error: milestoneError } = await supabase
            .from('milestones')
            .select('*')
            .eq('project_id', project.id);

          if (milestoneError) throw milestoneError;

          return { ...project, milestones: milestoneData || [] };
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

        setProjects(parsedProjects);
      } catch (err) {
        console.error('Error fetching projects:', err);
        setError('Failed to load active projects. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [user?.sub]);

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
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-accent mb-2">Project Report</h3>
                <p className="text-sm text-gray-400">{project.report}</p>
              </div>
            )}

            {project.milestones?.length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-semibold text-accent mb-2">Milestones</h3>
                <ul className="space-y-2">
                  {project.milestones.map((milestone) => (
                    <li key={milestone.id} className="text-sm text-gray-400">
                      <div className="flex justify-between">
                        <div>
                          <strong>{milestone.title}</strong>
                          {milestone.due_date && (
                            <span className="text-xs text-gray-500 ml-2">
                              Due: {format(new Date(milestone.due_date), 'MMM d, yyyy')}
                            </span>
                          )}
                        </div>
                        <span className="text-sm text-gray-500">
                          ${milestone.amount}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
