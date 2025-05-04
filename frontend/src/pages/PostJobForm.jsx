import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import supabase from '../utils/supabaseClient';

export default function PostJobForm({ embed = false }) {
  const { user, getAccessTokenSilently } = useAuth0();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');
  const [milestones, setMilestones] = useState([
    { title: '', description: '', dueDate: '', amount: '' }
  ]);
  const [contractSections, setContractSections] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get('/api/contracts/template', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) {
          setContractSections(res.data.template.sections);
        }
      } catch (err) {
        console.error('Failed to load contract template:', err);
      }
    })();
  }, [getAccessTokenSilently]);

  const addMilestone = () =>
    setMilestones([
      ...milestones,
      { title: '', description: '', dueDate: '', amount: '' }
    ]);
  const removeMilestone = (i) =>
    setMilestones(milestones.filter((_, idx) => idx !== i));
  const updateMilestone = (i, field, value) => {
    const copy = [...milestones];
    copy[i][field] = value;
    setMilestones(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const { data: project, error: projectError } = await supabase
        .from('projects')
        .insert({
          client_id: user.sub,
          title,
          description,
          skills: skillsArray,
          budget: parseFloat(budget),
          duration,
          status: 'open'
        })
        .select('id')
        .single();
      if (projectError) throw projectError;

      const projectId = project.id;

      const msToInsert = milestones.map((m) => ({
        project_id: projectId,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount)
      }));
      const { error: msError } = await supabase
        .from('milestones')
        .insert(msToInsert);
      if (msError) throw msError;

      const token = await getAccessTokenSilently();
      await axios.post(
        '/api/contracts',
        {
          projectId,
          freelancerId: null,
          title: `Contract for "${title}"`,
          contractSections
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setSubmitted(true);
    } catch (err) {
      console.error('Error posting job + creating contract:', err);
      // you can toast.error here if you like
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <section className="text-center">
        <h1 className="text-accent text-2xl mb-4">
          Job & Contract Created!
        </h1>
        <p>Your job is live and the contract has been generated.</p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-4xl mx-auto p-6 bg-[#1a1a1a] rounded-lg"
    >
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
          <p className="text-gray-400 mb-6">
            Fill out the details and set your milestones.
          </p>
        </>
      )}

      <label className="block">
        <span className="text-gray-300">Job Title</span>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="form-input mt-1"
        />
      </label>

      <label className="block">
        <span className="text-gray-300">Description</span>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          required
          className="form-textarea mt-1"
        />
      </label>

      <label className="block">
        <span className="text-gray-300">Skills (comma-separated)</span>
        <input
          type="text"
          value={skills}
          onChange={(e) => setSkills(e.target.value)}
          className="form-input mt-1"
        />
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="block">
          <span className="text-gray-300">Budget (ZAR)</span>
          <input
            type="number"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            required
            className="form-input mt-1"
          />
        </label>
        <label className="block">
          <span className="text-gray-300">Duration (days)</span>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            className="form-input mt-1"
          />
        </label>
      </div>

      <div className="border border-gray-700 p-4 rounded-lg">
        <h2 className="text-lg text-accent font-semibold mb-3">Milestones</h2>
        {milestones.map((m, i) => (
          <div key={i} className="mb-4 p-3 bg-[#222] rounded">
            <div className="flex justify-between items-center mb-2">
              <span className="font-medium text-white">
                Milestone {i + 1}
              </span>
              <button
                type="button"
                onClick={() => removeMilestone(i)}
                className="text-red-500 hover:text-red-400"
                disabled={milestones.length === 1}
              >
                Remove
              </button>
            </div>
            <label className="block mb-2">
              <span className="text-gray-300 text-sm">Title</span>
              <input
                type="text"
                value={m.title}
                onChange={(e) =>
                  updateMilestone(i, 'title', e.target.value)
                }
                className="form-input mt-1 text-sm"
              />
            </label>
            <label className="block mb-2">
              <span className="text-gray-300 text-sm">Amount (ZAR)</span>
              <input
                type="number"
                value={m.amount}
                onChange={(e) =>
                  updateMilestone(i, 'amount', e.target.value)
                }
                className="form-input mt-1 text-sm"
              />
            </label>
            <label className="block mb-2">
              <span className="text-gray-300 text-sm">Due Date</span>
              <input
                type="date"
                value={m.dueDate}
                onChange={(e) =>
                  updateMilestone(i, 'dueDate', e.target.value)
                }
                className="form-input mt-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="text-gray-300 text-sm">Description</span>
              <textarea
                value={m.description}
                onChange={(e) =>
                  updateMilestone(i, 'description', e.target.value)
                }
                rows={2}
                className="form-textarea mt-1 text-sm"
              />
            </label>
          </div>
        ))}
        <button
          type="button"
          onClick={addMilestone}
          className="mt-2 primary-btn"
        >
          + Add Milestone
        </button>
      </div>

      <footer className="flex justify-end">
        {!embed && (
          <button
            type="button"
            onClick={() => (window.location.href = '/client')}
            className="mr-4 border border-gray-600 rounded px-4 py-2 text-gray-300"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isLoading}
          className="primary-btn"
        >
          {isLoading ? 'Posting…' : 'Post Job & Generate Contract'}
        </button>
      </footer>
    </form>
  );
}