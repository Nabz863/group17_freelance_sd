// src/pages/PostJobForm.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 }    from '@auth0/auth0-react';
import supabase        from '../utils/supabaseClient';
import '../styles/theme.css';

export default function PostJobForm({ embed = false }) {
  const { user } = useAuth0();
  const navigate  = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle]         = useState('');
  const [details, setDetails]     = useState('');
  const [requirements, setReqs]   = useState('');
  const [milestones, setMilestones] = useState([
    { title: '', dueDate: '', amount: '' }
  ]);

  const handleAddMilestone    = () => setMilestones(m => [...m, { title: '', dueDate: '', amount: '' }]);
  const handleRemoveMilestone = i => setMilestones(m => m.length > 1 ? m.filter((_,idx) => idx !== i) : m);
  const handleMSChange        = (i, f, v) => {
    const copy = [...milestones];
    copy[i][f] = v;
    setMilestones(copy);
  };

  const handleSubmit = async e => {
    e.preventDefault();

    // Build a single JSON blob with everything
    const payload = {
      title,
      details,
      requirements,
      milestones: milestones.filter(m => m.title.trim()),
    };

    const { error } = await supabase
      .from('projects')
      .insert({
        client_id:   user.sub,
        description: JSON.stringify(payload),
        completed:   false,
      });

    if (error) {
      console.error('Job post submission failed:', error);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="text-center my-16">
        <h1 className="text-accent text-2xl mb-4">Job Posted!</h1>
        <p>Your job is now live for freelancers to apply.</p>
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto p-4">
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400">Describe it below and your milestones will be captured.</p>
        </>
      )}

      <label className="block">
        <span className="text-gray-300">Job Title</span>
        <input
          className="form-input"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="text-gray-300">Description & Details</span>
        <textarea
          className="form-textarea"
          rows={4}
          value={details}
          onChange={e => setDetails(e.target.value)}
          required
        />
      </label>

      <label className="block">
        <span className="text-gray-300">Requirements (optional)</span>
        <textarea
          className="form-textarea"
          rows={3}
          value={requirements}
          onChange={e => setReqs(e.target.value)}
        />
      </label>

      <div className="border border-gray-700 rounded p-4">
        <h3 className="text-white mb-2">Milestones</h3>
        {milestones.map((m, i) => (
          <div key={i} className="mb-3 p-3 bg-[#1a1a1a] rounded">
            <div className="flex justify-between">
              <strong className="text-white">Milestone {i+1}</strong>
              <button
                type="button"
                className="text-red-500 hover:text-red-400"
                onClick={() => handleRemoveMilestone(i)}
                disabled={milestones.length===1}
              >
                Remove
              </button>
            </div>
            <input
              className="form-input mt-2"
              placeholder="Title"
              value={m.title}
              onChange={e => handleMSChange(i, 'title', e.target.value)}
              required
            />
            <input
              type="date"
              className="form-input mt-2"
              value={m.dueDate}
              onChange={e => handleMSChange(i, 'dueDate', e.target.value)}
              required
            />
            <input
              type="number"
              className="form-input mt-2"
              placeholder="Amount (ZAR)"
              value={m.amount}
              onChange={e => handleMSChange(i, 'amount', e.target.value)}
              required
            />
          </div>
        ))}
        <button
          type="button"
          className="primary-btn"
          onClick={handleAddMilestone}
        >
          + Add Milestone
        </button>
      </div>

      <button type="submit" className="primary-btn w-full">
        Submit Job
      </button>
    </form>
  );
}