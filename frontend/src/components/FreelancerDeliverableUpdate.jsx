import React, { useState } from 'react';
import supabase from '../utils/supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';

export default function FreelancerDeliverableUpdate({ deliverable }) {
  const { user } = useAuth0();
  const [description, setDescription] = useState(deliverable.description);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('deliverables')
        .update({
          description,
          submitted_by: user.sub,
          submitted_at: new Date().toISOString()
        })
        .eq('id', { type: 'uuid', value: deliverable.id });

      if (error) throw error;
    } catch (err) {
      console.error('Error updating deliverable:', err);
      setError('Failed to update deliverable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="mt-4">
      <section className="card-glow p-4 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]">
        <h3 className="text-sm font-semibold text-accent mb-2">Update Deliverable</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <section>
            <label className="block text-sm text-gray-300 mb-1">
              Updated Deliverable Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full p-2 rounded bg-[#2a2a2a] border border-[#1abc9c] text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1abc9c]"
              placeholder="Enter your updated deliverable description..."
              required
            />
          </section>
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || !description.trim()}
            className="primary-btn w-full"
          >
            {loading ? 'Updating...' : 'Update Deliverable'}
          </button>
        </form>
      </section>
    </section>
  );
}