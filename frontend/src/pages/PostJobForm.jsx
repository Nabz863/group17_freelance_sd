import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import '../styles/theme.css';
import { fetchContractTemplate, createContract } from '../services/contractAPI';

export default function PostJobForm({ embed = false }) {
  const { user } = useAuth0();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    deadline: ''
  });
  const [milestones, setMilestones] = useState([
    { title: '', dueDate: '', amount: '' }
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [contractTemplate, setContractTemplate] = useState(null);

  // load default contract template once
  useEffect(() => {
    (async () => {
      try {
        const sections = await fetchContractTemplate();
        setContractTemplate(sections);
      } catch (e) {
        console.error('Could not load contract template:', e);
      }
    })();
  }, []);

  const handleChange = e => {
    setFormData(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleMilestoneChange = (i, field, val) => {
    setMilestones(ms => {
      const copy = [...ms];
      copy[i][field] = val;
      return copy;
    });
  };

  const handleAddMilestone = () => {
    setMilestones(ms => [...ms, { title: '', dueDate: '', amount: '' }]);
  };

  const handleRemoveMilestone = i => {
    if (milestones.length === 1) return;
    setMilestones(ms => ms.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      // 1) create the project
      const { data: project, error: pErr } = await supabase
        .from('projects')
        .insert({
          client_id: user.sub,
          description: JSON.stringify({
            title: formData.title,
            details: formData.description,
            requirements: formData.requirements,
            budget: formData.budget,
            deadline: formData.deadline
          }),
          completed: false
        })
        .select('id')
        .single();
      if (pErr) throw pErr;

      // 2) create milestones
      const msToInsert = milestones
        .filter(m => m.title && m.dueDate && m.amount)
        .map(m => ({
          project_id: project.id,
          title: m.title,
          due_date: m.dueDate,
          amount: parseFloat(m.amount)
        }));
      if (msToInsert.length) {
        const { error: mErr } = await supabase.from('milestones').insert(msToInsert);
        if (mErr) console.error('Milestones error:', mErr);
      }

      // 3) create the default contract
      await createContract({
        projectId: project.id,
        title: formData.title,
        freelancerId: '',                 // blank until a freelancer is assigned
        contractSections: contractTemplate
      });

      setSubmitted(true);
    } catch (err) {
      console.error('Job post submission failed:', err);
      setError(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <section className="text-center">
        <h1 className="text-accent text-2xl mb-4">Job Posted Successfully</h1>
        <p>Your job is now live for freelancers to apply.</p>
        {!embed && (
          <button
            className="primary-btn mt-4"
            onClick={() => navigate('/client')}
          >
            Back to Dashboard
          </button>
        )}
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-6">
            Describe your project and attract the right freelancers
          </p>
        </>
      )}

      {/* Basic fields */}
      <label className="form-label">
        Job Title:
        <input
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="form-input"
        />
      </label>

      <label className="form-label">
        Project Description:
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows="4"
          required
          className="form-textarea"
        />
      </label>

      <label className="form-label">
        Requirements:
        <textarea
          name="requirements"
          value={formData.requirements}
          onChange={handleChange}
          rows="3"
          className="form-textarea"
        />
      </label>

      <label className="form-label">
        Budget (ZAR):
        <input
          type="number"
          name="budget"
          value={formData.budget}
          onChange={handleChange}
          className="form-input"
          required
        />
      </label>

      <label className="form-label">
        Deadline:
        <input
          type="date"
          name="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className="form-input"
          required
        />
      </label>

      {/* Milestones */}
      <div className="border border-gray-700 rounded-lg p-4 mb-6">
        <h3 className="text-lg font-semibold text-white mb-3">Milestones</h3>
        {milestones.map((m, i) => (
          <div
            key={i}
            className="mb-4 p-4 border border-gray-700 rounded bg-[#1a1a1a]"
          >
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-medium">Milestone {i + 1}</h4>
              <button
                type="button"
                onClick={() => handleRemoveMilestone(i)}
                className="text-red-500 hover:text-red-400"
                disabled={milestones.length === 1}
              >
                Remove
              </button>
            </div>

            <label className="form-label text-sm">
              Title
              <input
                type="text"
                value={m.title}
                onChange={e =>
                  handleMilestoneChange(i, 'title', e.target.value)
                }
                className="form-input"
                required
              />
            </label>

            <label className="form-label text-sm mt-2">
              Amount (ZAR)
              <input
                type="number"
                value={m.amount}
                onChange={e =>
                  handleMilestoneChange(i, 'amount', e.target.value)
                }
                className="form-input"
                required
                min="1"
              />
            </label>

            <label className="form-label text-sm mt-2">
              Due Date
              <input
                type="date"
                value={m.dueDate}
                onChange={e =>
                  handleMilestoneChange(i, 'dueDate', e.target.value)
                }
                className="form-input"
                required
              />
            </label>
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddMilestone}
          className="mt-2 px-4 py-1 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition-colors"
        >
          + Add Milestone
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Actions */}
      <div className="flex justify-end space-x-4">
        {!embed && (
          <button
            type="button"
            onClick={() => navigate('/client')}
            className="px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="px-6 py-2 bg-[#1abc9c] rounded-md text-white hover:bg-[#16a085] transition-colors disabled:opacity-50"
        >
          {submitting ? 'Posting…' : 'Submit Job'}
        </button>
      </div>
    </form>
  );
}

