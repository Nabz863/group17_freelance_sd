// src/components/DeliverableForm.jsx

import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';

export default function DeliverableForm({ projectId, milestone }) {
  const { user } = useAuth0();
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!description.trim()) return;

    setSubmitting(true);

    // payload now keys off project_id, not contract_id
    const payload = {
      project_id: projectId,
      milestone_number: milestone.number,  // your integer field
      description,
      submitted_by: user.sub,
      status: 'pending',
    };

    const { error } = await supabase
      .from('deliverables')
      .insert(payload);

    if (error) {
      console.error('Error submitting deliverable:', error);
    } else {
      setDescription('');
    }

    setSubmitting(false);
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4 space-y-2">
      <textarea
        className="w-full p-2 bg-gray-800 border border-gray-700 rounded text-white text-sm"
        rows={3}
        placeholder="Describe or link your deliverable…"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <button
        type="submit"
        disabled={submitting}
        className={`px-4 py-2 rounded ${
          submitting 
            ? 'bg-gray-600 text-gray-300 cursor-not-allowed' 
            : 'bg-[#1abc9c] text-black hover:bg-[#159a7c]'
        }`}
      >
        {submitting ? 'Submitting…' : 'Submit Deliverable'}
      </button>
    </form>
  );
}
