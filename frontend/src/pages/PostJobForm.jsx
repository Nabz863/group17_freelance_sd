// src/pages/PostJobForm.jsx
import React, { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import '../styles/theme.css';

export default function PostJobForm({ embed = false }) {
  const { user } = useAuth0();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    budget: '',
    deadline: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // your real Auth0 user.sub goes here
    const clientId = user.sub;

    // we pack everything into the one TEXT column "description"
    const payload = {
      title:        formData.title,
      details:      formData.description,
      requirements: formData.requirements,
      budget:       formData.budget,
      deadline:     formData.deadline
    };

    const { data, error } = await supabase
      .from('projects')
      .insert({
        client_id:  clientId,
        description: JSON.stringify(payload),
        completed:   false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Job post submission failed:', error);
      return;
    }

    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section className="text-center">
        <h1 className="text-accent text-2xl mb-4">
          Job Posted Successfully
        </h1>
        <p>Your job is now live for freelancers to apply.</p>
      </section>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-2xl mx-auto"
    >
      {!embed && (
        <>
          <h1 className="text-3xl text-accent font-bold">
            Post a New Job
          </h1>
          <p className="text-gray-400 mb-6">
            Describe your project and attract the right freelancers
          </p>
        </>
      )}

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
        Budget:
        <input
          type="text"
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

      <footer className="form-footer">
        <button type="submit" className="primary-btn">
          Submit Job
        </button>
      </footer>
    </form>
  );
}
