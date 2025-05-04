import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import '../styles/theme.css';

export default function PostJobForm({ embed = false }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [submitted, setSubmitted] = useState(false);
  const [title, setTitle]             = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget]           = useState('');
  const [deadline, setDeadline]       = useState('');
  const [milestones, setMilestones]   = useState([
    { title: '', amount: '', dueDate: '' }
  ]);
  const [loading, setLoading] = useState(false);

  const [templateSections, setTemplateSections] = useState([]);
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await fetch('/api/contracts/template', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const body = await res.json();
        if (body.success) setTemplateSections(body.template.sections);
      } catch (err) {
        console.error('Could not load contract template', err);
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', amount: '', dueDate: '' }]);
  };

  const handleRemoveMilestone = (i) => {
    if (milestones.length > 1) {
      setMilestones(milestones.filter((_, idx) => idx !== i));
    }
  };

  const handleMilestoneChange = (i, field, val) => {
    const updated = [...milestones];
    updated[i][field] = val;
    setMilestones(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: proj, error: projErr } = await supabase
        .from('projects')
        .insert({
          client_id: user.sub,
          description: JSON.stringify({
            title, details: description, requirements, budget, deadline
          }),
          completed: false
        })
        .select('id')
        .single();
      if (projErr) throw projErr;

      const msPayload = milestones
        .filter(m => m.title)
        .map(m => ({
          project_id: proj.id,
          title: m.title,
          due_date: m.dueDate,
          amount: parseFloat(m.amount)
        }));
      if (msPayload.length) {
        const { error: msErr } = await supabase
          .from('milestones')
          .insert(msPayload);
        if (msErr) throw msErr;
      }

      const token = await getAccessTokenSilently();
      const contractRes = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          projectId: proj.id,
          title: `Contract for ${title}`,
          freelancerId: null,
          contractSections: templateSections
        })
      });
      if (!contractRes.ok) {
        console.error('Error creating contract', await contractRes.json());
      }

      setSubmitted(true);
    } catch (err) {
      console.error('Job post submission failed:', err);
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="text-center p-8">
        <h1 className="text-accent text-2xl mb-4">Job &amp; Contract Created</h1>
        <p>Your job is live and a contract has been sent for review.</p>
        {!embed && (
          <button
            className="primary-btn mt-6"
            onClick={() => navigate('/client')}
          >
            Back to Dashboard
          </button>
        )}
      </section>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto p-4">
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-6">
            Describe your project and define milestones + budget.
          </p>
        </>
      )}

      <label className="form-label">
        Job Title*
        <input
          name="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="form-input"
        />
      </label>

      <label className="form-label">
        Description*
        <textarea
          name="description"
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows="4"
          required
          className="form-textarea"
        />
      </label>

      <label className="form-label">
        Requirements
        <textarea
          name="requirements"
          value={requirements}
          onChange={e => setRequirements(e.target.value)}
          rows="3"
          className="form-textarea"
        />
      </label>

      <div className="grid md:grid-cols-2 gap-4">
        <label className="form-label">
          Budget (ZAR)*
          <input
            type="number"
            name="budget"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            required
            className="form-input"
          />
        </label>
        <label className="form-label">
          Deadline*
          <input
            type="date"
            name="deadline"
            value={deadline}
            onChange={e => setDeadline(e.target.value)}
            required
            className="form-input"
          />
        </label>
      </div>

      <fieldset className="border p-4 rounded">
        <legend className="font-semibold">Milestones &amp; Payout</legend>
        {milestones.map((m, idx) => (
          <div key={idx} className="grid md:grid-cols-3 gap-4 mb-4 items-end">
            <label className="form-label">
              Title*
              <input
                value={m.title}
                onChange={e => handleMilestoneChange(idx, 'title', e.target.value)}
                required
                className="form-input"
              />
            </label>
            <label className="form-label">
              Amount (ZAR)*
              <input
                type="number"
                value={m.amount}
                onChange={e => handleMilestoneChange(idx, 'amount', e.target.value)}
                required
                className="form-input"
              />
            </label>
            <div className="flex items-center space-x-2">
              <label className="form-label mb-0">
                Due Date*
                <input
                  type="date"
                  value={m.dueDate}
                  onChange={e => handleMilestoneChange(idx, 'dueDate', e.target.value)}
                  required
                  className="form-input"
                />
              </label>
              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(idx)}
                  className="text-red-500 hover:text-red-400"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddMilestone}
          className="primary-btn mt-2"
        >
          + Add Milestone
        </button>
      </fieldset>

      <footer className="form-footer">
        {!embed && (
          <button
            type="button"
            onClick={() => navigate('/client')}
            className="secondary-btn mr-4"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="primary-btn"
        >
          {loading ? 'Posting…' : 'Submit Job'}
        </button>
      </footer>
    </form>
  );
}