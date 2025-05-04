import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import supabase from '../utils/supabaseClient';
import axios from 'axios';
import '../styles/theme.css';

export default function PostJobForm({ embed = false }) {
  const navigate = useNavigate();
  const { user, getAccessTokenSilently } = useAuth0();
  const [isLoading, setIsLoading] = useState(false);

  // Job form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [skills, setSkills] = useState('');
  const [budget, setBudget] = useState('');
  const [duration, setDuration] = useState('');

  // Always include a contract at job creation
  const [contractSections, setContractSections] = useState([]);

  // Milestones state
  const [milestones, setMilestones] = useState([
    { title: '', description: '', dueDate: '', amount: '' }
  ]);

  // Fetch default contract template once
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get('/api/contracts/template', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data.success && res.data.template.sections) {
          setContractSections(res.data.template.sections);
        }
      } catch (err) {
        console.error('Could not load contract template', err);
        toast.error('Failed to load contract template');
      }
    })();
  }, [getAccessTokenSilently]);

  const handleAddMilestone = () => {
    setMilestones(prev => [
      ...prev,
      { title: '', description: '', dueDate: '', amount: '' }
    ]);
  };

  const handleRemoveMilestone = index => {
    if (milestones.length <= 1) return;
    setMilestones(prev => prev.filter((_, i) => i !== index));
  };

  const handleMilestoneChange = (index, field, value) => {
    setMilestones(prev => {
      const arr = [...prev];
      arr[index][field] = value;
      return arr;
    });
  };

  const validateForm = () => {
    if (!title.trim()) return 'Job title is required';
    if (!description.trim()) return 'Job description is required';
    if (!budget.trim()) return 'Budget is required';
    if (!duration.trim()) return 'Duration is required';
    for (const m of milestones) {
      if (!m.title.trim()) return 'All milestone titles are required';
      if (!m.dueDate) return 'All milestone dates are required';
      if (!m.amount) return 'All milestone amounts are required';
    }
    return null;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errMsg = validateForm();
    if (errMsg) {
      toast.error(errMsg);
      return;
    }
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
          status: 'open',
          include_contract: true
        })
        .select('id')
        .single();
      if (projErr) throw projErr;

      // 2) Insert milestones
      const mileRecords = milestones.map(m => ({
        project_id: project.id,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount)
      }));
      const { error: mileErr } = await supabase.from('milestones').insert(mileRecords);
      if (mileErr) throw mileErr;

      // 3) Create initial contract (freelancerId = null for now)
      const token = await getAccessTokenSilently();
      const contractRes = await axios.post(
        '/api/contracts',
        {
          projectId: project.id,
          title: `Contract for ${title}`,
          freelancerId: null,
          contractSections
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!contractRes.data.success) {
        throw new Error(contractRes.data.message || 'Contract creation failed');
      }

      toast.success('Job posted, milestones saved, and contract generated!');
      if (!embed) {
        navigate('/client');
      } else {
        // reset form
        setTitle('');
        setDescription('');
        setSkills('');
        setBudget('');
        setDuration('');
        setMilestones([{ title: '', description: '', dueDate: '', amount: '' }]);
      }
    } catch (error) {
      console.error('Error posting job + creating contract:', error);
      toast.error('Failed to post job or generate contract');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-3xl text-accent font-bold">Post a New Job</h1>
        <p className="text-gray-400 mb-6">
          Describe your project and set milestones &amp; payment terms
        </p>

        {/* Job Title */}
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

        {/* Description */}
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

        {/* Skills */}
        <label className="form-label">
          Skills (comma-separated)
          <input
            name="skills"
            value={skills}
            onChange={e => setSkills(e.target.value)}
            className="form-input"
            placeholder="React, Node.js, etc."
          />
        </label>

        {/* Budget */}
        <label className="form-label">
          Budget (ZAR)*
          <input
            type="number"
            name="budget"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            className="form-input"
            required
          />
        </label>

        {/* Duration */}
        <label className="form-label">
          Duration (days)*
          <input
            type="number"
            name="duration"
            value={duration}
            onChange={e => setDuration(e.target.value)}
            className="form-input"
            required
          />
        </label>

        {/* Milestones */}
        <div className="border border-gray-700 rounded-lg p-4 mb-6">
          <h3 className="text-lg font-semibold text-white mb-3">Milestones &amp; Payments</h3>
          {milestones.map((m, i) => (
            <div key={i} className="mb-4 p-4 border border-gray-700 rounded bg-[#1a1a1a]">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-white font-medium">Milestone {i + 1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(i)}
                  className="text-red-500 hover:text-red-400"
                  disabled={milestones.length <= 1}
                >
                  Remove
                </button>
              </div>
              <label className="block text-gray-300 text-sm mb-1">Title</label>
              <input
                type="text"
                value={m.title}
                onChange={e => handleMilestoneChange(i, 'title', e.target.value)}
                className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white text-sm"
                placeholder="e.g., Design Phase"
              />
              <label className="block text-gray-300 text-sm mt-2 mb-1">Amount (ZAR)</label>
              <input
                type="number"
                value={m.amount}
                onChange={e => handleMilestoneChange(i, 'amount', e.target.value)}
                className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white text-sm"
                placeholder="e.g., 3000"
                min="0"
              />
              <label className="block text-gray-300 text-sm mt-2 mb-1">Due Date</label>
              <input
                type="date"
                value={m.dueDate}
                onChange={e => handleMilestoneChange(i, 'dueDate', e.target.value)}
                className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white text-sm"
              />
              <label className="block text-gray-300 text-sm mt-2 mb-1">Details (optional)</label>
              <textarea
                value={m.description}
                onChange={e => handleMilestoneChange(i, 'description', e.target.value)}
                className="w-full px-3 py-2 bg-[#222] border border-gray-700 rounded text-white text-sm"
                rows={2}
              />
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

        {/* Submit */}
        <div className="flex justify-end">
          {!embed && (
            <button
              type="button"
              onClick={() => navigate('/client')}
              className="mr-4 px-6 py-2 border border-gray-600 rounded text-gray-300 hover:bg-gray-800 transition-colors"
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
        </div>
      </form>
    </div>
  );
}
