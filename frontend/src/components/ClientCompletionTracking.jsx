import React, { useState } from 'react';
import supabase from '../utils/supabaseClient';

export default function ClientCompletionTracking({ projectId, milestones }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleMilestoneCompletion = async (milestoneId, isComplete) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('milestones')
        .update({
          completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null
        })
        .eq('id', { type: 'uuid', value: milestoneId });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating milestone:', err);
      setError('Failed to update milestone. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleProjectCompletion = async (isComplete) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('projects')
        .update({
          completed: isComplete,
          completed_at: isComplete ? new Date().toISOString() : null
        })
        .eq('id', { type: 'uuid', value: projectId });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating project:', err);
      setError('Failed to update project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Calculate project completion percentage
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.completed).length;
  const completionPercentage = totalMilestones > 0 
    ? Math.round((completedMilestones / totalMilestones) * 100)
    : 0;

  return (
    <section className="mt-4">
      <section className="card-glow p-4 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]">
        <h3 className="text-sm font-semibold text-accent mb-2">Completion Tracking</h3>
        
        <section className="space-y-4">
          {/* Project Completion Status */}
          <section className="flex items-center justify-between">
            <section>
              <h4 className="text-sm text-gray-300 mb-1">Project Completion</h4>
              <p className="text-sm font-semibold text-accent">{completionPercentage}% Complete</p>
            </section>
            <button
              onClick={() => handleProjectCompletion(true)}
              disabled={loading || completionPercentage < 100}
              className="secondary-btn px-4 py-1"
            >
              {loading ? 'Marking Complete...' : 'Mark Project Complete'}
            </button>
          </section>

          {/* Milestone Completion Status */}
          <section className="space-y-2">
            <h4 className="text-sm text-gray-300 mb-2">Milestone Completion</h4>
            {milestones.map((milestone) => (
              <section key={milestone.id} className="flex items-center justify-between">
                <section>
                  <p className="text-sm text-gray-300">{milestone.title}</p>
                  {milestone.completed && (
                    <p className="text-xs text-green-500">Completed</p>
                  )}
                </section>
                <button
                  onClick={() => handleMilestoneCompletion(milestone.id, !milestone.completed)}
                  disabled={loading}
                  className={`px-3 py-1 rounded ${
                    milestone.completed ? 'bg-green-500 text-white' : 'bg-gray-500 text-gray-100'
                  }`}
                >
                  {loading ? 'Updating...' : milestone.completed ? 'Completed' : 'Mark Complete'}
                </button>
              </section>
            ))}
          </section>

          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </section>
      </section>
    </section>
  );
}
