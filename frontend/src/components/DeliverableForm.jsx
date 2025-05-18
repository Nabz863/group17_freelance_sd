import React, { useState } from 'react';
import supabase from '../utils/supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';

export default function DeliverableForm({ projectId, milestone }) {
  const { user } = useAuth0();
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('deliverables')
        .insert({
          contract_id: { type: 'uuid', value: projectId },
          milestone_number: milestone.number,
          description,
          submitted_by: user.sub,
          status: 'pending'  // Added missing status field required by schema
        });

      if (error) throw error;

      // Reset form after successful submission
      setDescription('');
    } catch (err) {
      console.error('Error submitting deliverable:', err);
      setError('Failed to submit deliverable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="card-glow p-4 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]">
        <h3 className="text-sm font-semibold text-accent mb-2">Submit Deliverable</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-300 mb-1">
              Deliverable Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 rounded bg-[#2a2a2a] border border-[#1abc9c] text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1abc9c]"
              placeholder="Enter your deliverable description..."
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="primary-btn w-full"
          >
            {loading ? 'Submitting...' : 'Submit Deliverable'}
          </button>
        </form>
      </div>
    </div>
  );
}
