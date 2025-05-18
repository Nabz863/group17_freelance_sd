import React, { useState } from 'react';
import supabase from '../utils/supabaseClient';
import { useAuth0 } from '@auth0/auth0-react';

export default function ClientDeliverableApproval({ deliverable, projectId }) {
  const { user } = useAuth0();
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleApproval = async (status) => {
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase
        .from('deliverables')
        .update({
          status,
          approved_by: status === 'approved' ? user.sub : null,
          approved_at: status === 'approved' ? new Date().toISOString() : null,
          revision_comments: status === 'revision_requested' ? comments : null
        })
        .eq('id', deliverable.id);

      if (error) throw error;
    } catch (err) {
      console.error('Error updating deliverable:', err);
      setError('Failed to update deliverable. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="card-glow p-4 rounded-lg bg-[#1a1a1a] border border-[#1abc9c]">
        <h3 className="text-sm font-semibold text-accent mb-2">Deliverable Actions</h3>
        <div className="space-y-4">
          {deliverable.status === 'pending' && (
            <>
              <div>
                <label className="block text-sm text-gray-300 mb-1">
                  Revision Comments (if requesting revision)
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  rows={3}
                  className="w-full p-2 rounded bg-[#2a2a2a] border border-[#1abc9c] text-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1abc9c]"
                  placeholder="Enter your revision comments..."
                />
              </div>
              <div className="flex gap-4">
                <button
                  onClick={() => handleApproval('approved')}
                  disabled={loading}
                  className="primary-btn flex-1"
                >
                  {loading ? 'Approving...' : 'Approve'}
                </button>
                <button
                  onClick={() => handleApproval('revision_requested')}
                  disabled={loading}
                  className="secondary-btn flex-1"
                >
                  {loading ? 'Requesting Revision...' : 'Request Revision'}
                </button>
              </div>
            </>
          )}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
