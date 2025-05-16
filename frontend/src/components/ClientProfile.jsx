import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import '../styles/theme.css';

export default function ClientProfile() {
  const { user } = useAuth0();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    clientType: 'business',
    industry: '',
    projectNeeds: '',
    location: '',
    budgetRange: '',
    projectTimeline: '',
    contactPhone: '',
    contactEmail: '',
    preferredContact: 'email'
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('clients')
          .select('*')
          .eq('user_id', user.sub)
          .single();

        if (data) {
          setProfile(data);
          if (data.profile) {
            const profileData = typeof data.profile === 'string' 
              ? JSON.parse(data.profile) 
              : data.profile;
            setFormData(prev => ({
              ...prev,
              ...profileData
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.sub]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('clients')
        .update({ 
          profile: JSON.stringify(formData),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.sub);

      if (error) throw error;
      
      // Refresh the profile data
      const { data } = await supabase
        .from('clients')
        .select('*')
        .eq('user_id', user.sub)
        .single();
      
      setProfile(data);
      setEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return <p className="text-white">Loading profile...</p>;
  }

  if (!profile) {
    return <p className="text-white">No profile found. Please complete your profile setup first.</p>;
  }

  const clientTypes = [
    { value: 'business', label: 'Business' },
    { value: 'individual', label: 'Individual' },
    { value: 'startup', label: 'Startup' },
    { value: 'enterprise', label: 'Enterprise' }
  ];

  const budgetRanges = [
    'Under R5,000',
    'R5,000 - R10,000',
    'R10,000 - R25,000',
    'R25,000 - R50,000',
    'R50,000+'
  ];

  const projectTimelines = [
    '1-2 weeks',
    '2-4 weeks',
    '1-3 months',
    '3-6 months',
    '6+ months'
  ];

  const contactPreferences = [
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Phone' },
    { value: 'whatsapp', label: 'WhatsApp' }
  ];

  return (
    <div className="profile-container p-6 bg-[#0e0e0e] text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Client Profile</h2>
        {!editing ? (
          <button 
            onClick={() => setEditing(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded transition-colors"
          >
            Edit Profile
          </button>
        ) : (
          <div className="space-x-2">
            <button 
              onClick={() => setEditing(false)}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              form="profile-form"
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded transition-colors"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>

      {editing ? (
        <form id="profile-form" onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">First Name *</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Last Name *</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Company Name *</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Client Type *</label>
              <select
                name="clientType"
                value={formData.clientType || 'business'}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
                required
              >
                {clientTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Industry *</label>
            <input
              type="text"
              name="industry"
              value={formData.industry || ''}
              onChange={handleChange}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Project Needs *</label>
            <textarea
              name="projectNeeds"
              value={formData.projectNeeds || ''}
              onChange={handleChange}
              rows={3}
              required
              className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              placeholder="Briefly describe your project needs..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input
                type="text"
                name="location"
                value={formData.location || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Budget Range *</label>
              <select
                name="budgetRange"
                value={formData.budgetRange || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
                required
              >
                <option value="">Select budget range</option>
                {budgetRanges.map(range => (
                  <option key={range} value={range}>{range}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Project Timeline *</label>
              <select
                name="projectTimeline"
                value={formData.projectTimeline || ''}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
                required
              >
                <option value="">Select timeline</option>
                {projectTimelines.map(timeline => (
                  <option key={timeline} value={timeline}>{timeline}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-1">Contact Phone *</label>
              <input
                type="tel"
                name="contactPhone"
                value={formData.contactPhone || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
                placeholder="+27 12 345 6789"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Contact Email *</label>
              <input
                type="email"
                name="contactEmail"
                value={formData.contactEmail || ''}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded bg-gray-800 border-gray-700 text-white"
                placeholder="your@email.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Preferred Contact Method *</label>
            <div className="flex space-x-4 mt-2">
              {contactPreferences.map(pref => (
                <label key={pref.value} className="inline-flex items-center">
                  <input
                    type="radio"
                    name="preferredContact"
                    value={pref.value}
                    checked={formData.preferredContact === pref.value}
                    onChange={handleChange}
                    className="form-radio text-blue-500"
                    required
                  />
                  <span className="ml-2">{pref.label}</span>
                </label>
              ))}
            </div>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Full Name</p>
                <p className="font-medium">{formData.firstName} {formData.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Company</p>
                <p className="font-medium">{formData.companyName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Client Type</p>
                <p className="font-medium capitalize">{formData.clientType}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Industry</p>
                <p className="font-medium">{formData.industry}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Location</p>
                <p className="font-medium">{formData.location}</p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Project Details</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-400">Project Needs</p>
                <p className="whitespace-pre-line">{formData.projectNeeds}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Budget Range</p>
                  <p>{formData.budgetRange}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Project Timeline</p>
                  <p>{formData.projectTimeline}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6">
            <h3 className="text-xl font-semibold mb-4">Contact Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-400">Phone</p>
                <p>{formData.contactPhone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Email</p>
                <p>{formData.contactEmail}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Preferred Contact Method</p>
                <p className="capitalize">{formData.preferredContact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
