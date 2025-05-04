// src/pages/PostJobForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import supabase from '../utils/supabaseClient';
import axios from 'axios';

export default function PostJobForm({ embed }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);

  // Basic job fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');

  // Milestones
  const [milestones, setMilestones] = useState([
    { title: '', description: '', dueDate: '', amount: '' }
  ]);

  // Include contract
  const [includeContract, setIncludeContract] = useState(false);
  const [contractSections, setContractSections] = useState([]);

  // Fetch contract template when toggled on
  useEffect(() => {
    if (!includeContract) return;
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get('/api/contracts/template', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success) setContractSections(res.data.template.sections);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load contract template');
      }
    })();
  }, [includeContract, getAccessTokenSilently]);

  const handleAddMilestone = () =>
    setMilestones([...milestones, { title: '', description: '', dueDate: '', amount: '' }]);

  const handleRemoveMilestone = idx => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, i) => i !== idx));
  };

  const handleMilestoneChange = (idx, field, val) => {
    const updated = [...milestones];
    updated[idx][field] = val;
    setMilestones(updated);
  };

  const validate = () => {
    if (!title.trim()) return 'Job title is required';
    if (!description.trim()) return 'Job description is required';
    if (!budget) return 'Budget is required';
    if (!duration) return 'Duration is required';
    for (let m of milestones) {
      if (!m.title.trim()) return 'Each milestone needs a title';
      if (!m.dueDate) return 'Each milestone needs a due date';
      if (!m.amount) return 'Each milestone needs an amount';
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast.error(err);
      return;
    }

    setIsLoading(true);
    try {
      // 1) Create the project
      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean);
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          user_id: user.sub,
          title,
          description,
          skills: skillsArr,
          budget: parseFloat(budget),
          duration,
          status: 'open',
          include_contract: includeContract
        })
        .select('id')
        .single();
      if (projErr) throw projErr;

      const pid = project.id;

      // 2) Insert milestones
      const toInsert = milestones.map(m => ({
        project_id: pid,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount),
      }));
      const { error: msErr } = await supabase.from('milestones').insert(toInsert);
      if (msErr) throw msErr;

      // 3) Optionally kick off your PDF/contract generation
      if (includeContract) {
        const token = await getAccessTokenSilently();
        await axios.post(
          '/api/contracts',
          { projectId: pid, sections: contractSections },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }

      toast.success('Job posted successfully!');
      if (!embed) navigate('/client');
      else {
        // reset form in embed mode
        setTitle('');
        setDescription('');
        setSkills('');
        setBudget('');
        setDuration('');
        setMilestones([{ title: '', description: '', dueDate: '', amount: '' }]);
        setIncludeContract(false);
      }
    } catch (err) {
      console.error(err);
      toast.error('Failed to post job.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4">
      <h1 className="text-2xl font-bold text-white mb-6">Post a New Job</h1>
      <form onSubmit={handleSubmit} className="space-y-6">

        {/* === Job Basics === */}
        <div>
          <label className="block text-gray-300 mb-1">Job Title*</label>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white"
            required
          />
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Description*</label>
          <textarea
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-300 mb-1">Skills (comma-separated)</label>
            <input
              type="text"
              value={skills}
              onChange={e => setSkills(e.target.value)}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white"
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-1">Budget ($)*</label>
            <input
              type="number"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-gray-300 mb-1">Duration (days)*</label>
          <input
            type="number"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white"
            required
          />
        </div>

        {/* === Milestones === */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h2 className="text-lg text-white mb-3">Milestones</h2>
          {milestones.map((m, i) => (
            <div key={i} className="mb-4 p-3 bg-[#1a1a1a] rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Milestone {i + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(i)}
                  className="text-red-500"
                  disabled={milestones.length === 1}
                >
                  Remove
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-300 mb-1">Title*</label>
                  <input
                    type="text"
                    value={m.title}
                    onChange={e => handleMilestoneChange(i, 'title', e.target.value)}
                    className="w-full px-2 py-1 bg-[#222] border border-gray-700 rounded text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-gray-300 mb-1">Amount ($)*</label>
                  <input
                    type="number"
                    value={m.amount}
                    onChange={e => handleMilestoneChange(i, 'amount', e.target.value)}
                    className="w-full px-2 py-1 bg-[#222] border border-gray-700 rounded text-white"
                    required
                  />
                </div>
              </div>
              <div className="mt-2">
                <label className="block text-gray-300 mb-1">Due Date*</label>
                <input
                  type="date"
                  value={m.dueDate}
                  onChange={e => handleMilestoneChange(i, 'dueDate', e.target.value)}
                  className="w-full px-2 py-1 bg-[#222] border border-gray-700 rounded text-white"
                  required
                />
              </div>
              <div className="mt-2">
                <label className="block text-gray-300 mb-1">Description</label>
                <textarea
                  value={m.description}
                  onChange={e => handleMilestoneChange(i, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-2 py-1 bg-[#222] border border-gray-700 rounded text-white"
                />
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMilestone}
            className="px-4 py-1 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800"
          >
            + Add Milestone
          </button>
        </div>

        {/* === Contract Toggle === */}
        <div className="flex items-center">
          <input
            id="includeContract"
            type="checkbox"
            checked={includeContract}
            onChange={() => setIncludeContract(v => !v)}
            className="mr-2"
          />
          <label htmlFor="includeContract" className="text-gray-300">
            Include standard contract
          </label>
        </div>

        {/* === Actions === */}
        <div className="flex justify-end space-x-4">
          {!embed && (
            <button
              type="button"
              onClick={() => navigate('/client')}
              className="px-6 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="px-6 py-2 bg-[#1abc9c] rounded text-white hover:bg-[#16a085] disabled:opacity-50"
          >
            {isLoading ? 'Posting…' : 'Post Job'}
          </button>
        </div>
      </form>
    </div>
  );
}