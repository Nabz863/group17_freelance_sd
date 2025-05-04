// src/pages/PostJobForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import supabase from '../utils/supabaseClient';
import '../styles/theme.css';

export default function PostJobForm({ embed = false }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();

  const [isLoading, setIsLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');

  // Milestones state
  const [milestones, setMilestones] = useState([
    { title: '', dueDate: '', amount: '' }
  ]);

  // Contract template sections
  const [contractSections, setContractSections] = useState([]);

  // Load default contract template on mount
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const resp = await axios.get('/api/contracts/template', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (resp.data.success && resp.data.template.sections) {
          setContractSections(resp.data.template.sections);
        }
      } catch (err) {
        console.error('Could not load contract template:', err);
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', dueDate: '', amount: '' }]);
  };

  const handleRemoveMilestone = (i) => {
    if (milestones.length === 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };

  const handleMilestoneChange = (i, field, value) => {
    const copy = [...milestones];
    copy[i][field] = value;
    setMilestones(copy);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // 1) Create the project
      const skillsArray = skills.split(',').map(s => s.trim()).filter(Boolean);
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          client_id: user.sub,
          title,
          description,
          skills: skillsArray,
          budget: parseFloat(budget),
          duration,
          include_contract: true
        })
        .select('id')
        .single();

      if (projErr) throw projErr;

      // 2) Create milestones
      const toInsert = milestones
        .filter(m => m.title.trim())
        .map(m => ({
          project_id: project.id,
          title: m.title,
          due_date: m.dueDate,
          amount: parseFloat(m.amount)
        }));
      if (toInsert.length) {
        const { error: msErr } = await supabase
          .from('milestones')
          .insert(toInsert);
        if (msErr) throw msErr;
      }

      // 3) Immediately generate a contract (freelancerId blank until assigned)
      const token = await getAccessTokenSilently();
      await axios.post(
        '/api/contracts',
        {
          projectId: project.id,
          title: `Contract for ${title}`,
          freelancerId: '',           // will be assigned later
          contractSections
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // 4) Done
      if (!embed) {
        navigate('/client');
      } else {
        // reset if embedded
        setTitle('');
        setDescription('');
        setSkills('');
        setBudget('');
        setDuration('');
        setMilestones([{ title: '', dueDate: '', amount: '' }]);
      }
    } catch (err) {
      console.error('Job post submission failed:', err);
      // you can toast.error(...) here if you like
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        {!embed && (
          <>
            <h1 className="text-2xl font-bold text-white mb-4">Post a New Job</h1>
            <p className="text-gray-400 mb-6">
              Fill out the details below and your contract will be generated automatically.
            </p>
          </>
        )}

        {/* Title */}
        <div>
          <label className="block text-gray-300 mb-2">Job Title</label>
          <input
            className="w-full px-4 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:border-[#1abc9c] focus:outline-none"
            value={title}
            onChange={e => setTitle(e.target.value)}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-300 mb-2">Description</label>
          <textarea
            className="w-full px-4 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:border-[#1abc9c] focus:outline-none"
            rows={4}
            value={description}
            onChange={e => setDescription(e.target.value)}
            required
          />
        </div>

        {/* Skills */}
        <div>
          <label className="block text-gray-300 mb-2">Skills (comma separated)</label>
          <input
            className="w-full px-4 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:border-[#1abc9c] focus:outline-none"
            value={skills}
            onChange={e => setSkills(e.target.value)}
          />
        </div>

        {/* Budget & Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-300 mb-2">Budget (ZAR)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:border-[#1abc9c] focus:outline-none"
              value={budget}
              onChange={e => setBudget(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-gray-300 mb-2">Duration (days)</label>
            <input
              type="number"
              className="w-full px-4 py-2 bg-[#222] border border-gray-700 rounded-md text-white focus:border-[#1abc9c] focus:outline-none"
              value={duration}
              onChange={e => setDuration(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Milestones */}
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-3">Milestones</h3>
          {milestones.map((m, i) => (
            <div key={i} className="mb-4 p-3 bg-[#1a1a1a] rounded">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white">Milestone {i + 1}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(i)}
                  className="text-red-500 hover:text-red-400"
                  disabled={milestones.length === 1}
                >
                  Remove
                </button>
              </div>
              <input
                placeholder="Title"
                className="w-full mb-2 px-3 py-2 bg-[#222] border border-gray-700 rounded text-white focus:border-[#1abc9c] focus:outline-none"
                value={m.title}
                onChange={e => handleMilestoneChange(i, 'title', e.target.value)}
                required
              />
              <input
                type="date"
                className="w-full mb-2 px-3 py-2 bg-[#222] border border-gray-700 rounded text-white focus:border-[#1abc9c] focus:outline-none"
                value={m.dueDate}
                onChange={e => handleMilestoneChange(i, 'dueDate', e.target.value)}
                required
              />
              <input
                type="number"
                placeholder="Amount"
                className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white focus:border-[#1abc9c] focus:outline-none"
                value={m.amount}
                onChange={e => handleMilestoneChange(i, 'amount', e.target.value)}
                required
              />
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddMilestone}
            className="primary-btn"
          >
            + Add Milestone
          </button>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          {!embed && (
            <button
              type="button"
              onClick={() => navigate('/client')}
              className="mr-4 px-6 py-2 border border-gray-600 rounded-md text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isLoading}
            className="primary-btn disabled:opacity-50"
          >
            {isLoading ? 'Posting…' : 'Post Job & Generate Contract'}
          </button>
        </div>
      </form>
    </div>
  );
}
