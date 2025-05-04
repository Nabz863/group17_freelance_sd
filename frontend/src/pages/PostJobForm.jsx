import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/theme.css';

export default function PostJobForm({ embed = false }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');

  const [milestones, setMilestones] = useState([
    { title: '', description: '', dueDate: '', amount: '' }
  ]);

  const [isLoading, setIsLoading] = useState(false);

  const addMilestone = () =>
    setMilestones([
      ...milestones,
      { title: '', description: '', dueDate: '', amount: '' }
    ]);
  const removeMilestone = (idx) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };
  const updateMilestone = (idx, field, value) => {
    const copy = [...milestones];
    copy[idx][field] = value;
    setMilestones(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data: project, error: projectErr } = await supabase
        .from('projects')
        .insert({
          client_id: user.sub,
          description: JSON.stringify({
            title,
            details: description,
            requirements,
            budget,
            deadline
          }),
          completed: false,
          include_contract: true
        })
        .select('id')
        .single();
      if (projectErr) throw projectErr;

      const milestoneRows = milestones.map((m) => ({
        project_id: project.id,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount)
      }));
      const { error: msErr } = await supabase
        .from('milestones')
        .insert(milestoneRows);
      if (msErr) throw msErr;

      const token = await getAccessTokenSilently();
      const contractRes = await axios.post(
        '/api/contracts',
        {
          projectId: project.id,
          clientId: user.sub,
          freelancerId: null,
          title: `Contract for ${title}`,
          contractSections: milestones
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success('Job posted and contract PDF created!');
      if (!embed) navigate('/client');
      else {
        setTitle('');
        setDescription('');
        setRequirements('');
        setBudget('');
        setDeadline('');
        setMilestones([{ title: '', description: '', dueDate: '', amount: '' }]);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to post job or generate contract.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <p className="text-center text-accent">Posting… please wait</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto">
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-6">
            Describe your project, set milestones & auto-generate the contract
          </p>
        </>
      )}

      <label className="form-label">
        Job Title
        <input
          type="text"
          className="form-input"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
      </label>

      <label className="form-label">
        Description
        <textarea
          className="form-textarea"
          rows="4"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
      </label>

      <label className="form-label">
        Requirements
        <textarea
          className="form-textarea"
          rows="3"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
        />
      </label>

      <div className="grid grid-cols-2 gap-4">
        <label className="form-label">
          Budget (ZAR)
          <input
            type="number"
            className="form-input"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
          />
        </label>
        <label className="form-label">
          Deadline
          <input
            type="date"
            className="form-input"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            required
          />
        </label>
      </div>

      <section className="border border-gray-700 rounded-lg p-4">
        <h2 className="text-lg text-accent font-semibold mb-3">Milestones</h2>
        {milestones.map((m, i) => (
          <div key={i} className="mb-4 p-4 bg-[#1a1a1a] rounded">
            <div className="flex justify-between items-center mb-2">
              <strong className="text-white">Milestone {i + 1}</strong>
              <button
                type="button"
                className="secondary-btn"
                onClick={() => removeMilestone(i)}
                disabled={milestones.length === 1}
              >
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Title"
                className="form-input"
                value={m.title}
                onChange={(e) => updateMilestone(i, 'title', e.target.value)}
                required
              />
              <input
                placeholder="Amount"
                type="number"
                className="form-input"
                value={m.amount}
                onChange={(e) => updateMilestone(i, 'amount', e.target.value)}
                required
              />
            </div>
            <textarea
              placeholder="Description"
              className="form-textarea mt-2"
              rows="2"
              value={m.description}
              onChange={(e) =>
                updateMilestone(i, 'description', e.target.value)
              }
            />
            <input
              type="date"
              className="form-input mt-2"
              value={m.dueDate}
              onChange={(e) => updateMilestone(i, 'dueDate', e.target.value)}
              required
            />
          </div>
        ))}
        <button
          type="button"
          className="secondary-btn"
          onClick={addMilestone}
        >
          + Add Milestone
        </button>
      </section>

      <footer className="form-footer flex justify-end">
        <button type="submit" className="primary-btn">
          Submit Job
        </button>
      </footer>
    </form>
  );
}
