import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import UserSearch from './UserSearch';

export default function ReportIssue({ onClose }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    reportedId: '',
    reportedEmail: '',
    reportedName: '',
    title: '',
    description: ''
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setFormData({
      ...formData,
      reportedId: user.id,
      reportedEmail: user.email,
      reportedName: user.name
    });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const { user } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('User not authenticated');
      }

      if (!selectedUser || !formData.title || !formData.description) {
        throw new Error('Please select a user and fill in all fields');
      }

      const { error: insertError } = await supabase
        .from('issues')
        .insert({
          reporter_id: user.id,
          reported_id: formData.reportedId,
          title: formData.title,
          description: formData.description,
          reported_email: formData.reportedEmail,
          reported_name: formData.reportedName,
          status: 'pending',
          created_at: new Date().toISOString()
        });

      if (insertError) throw insertError;

      // Get admin user ID from environment variable
      const adminId = process.env.REACT_APP_AUTH0_ADMIN_ID;

      // Create a detailed message notification for admin
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          sender_id: user.id,
          receiver_id: adminId,
          text: `New issue reported by ${user.email}:
Title: ${formData.title}
Description: ${formData.description}
Reported User: ${formData.reportedName} (${formData.reportedEmail})
User ID: ${formData.reportedId}`,
          project_id: null,
          created_at: new Date().toISOString()
        });

      if (messageError) {
        console.error('Error creating admin notification:', messageError);
      }

      setSuccess('Issue reported successfully! Admin has been notified.');
      setTimeout(() => {
        onClose();
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Error reporting issue:', error);
      setError(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4">
      <div className="bg-gray-800 rounded-lg shadow-lg w-full max-w-2xl p-6 space-y-8">
        <h2 className="text-2xl font-bold mb-6 text-center">Report Issue</h2>
        {error && (
          <div className="text-red-400 mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="text-green-400 mb-4">
            {success}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Reported User</h3>
            <div className="space-y-4">
              <UserSearch onSelectUser={handleUserSelect} />
              {selectedUser && (
                <div className="bg-gray-800 p-4 rounded-lg">
                  <div className="font-semibold">Selected User:</div>
                  <div className="text-lg mt-2">{selectedUser.name}</div>
                  <div className="text-sm text-gray-400 mt-1">{selectedUser.email}</div>
                  <div className="text-xs text-gray-500 mt-1">{selectedUser.role}</div>
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setFormData({
                        ...formData,
                        reportedId: '',
                        reportedEmail: '',
                        reportedName: ''
                      });
                    }}
                    className="text-red-400 hover:text-red-300 mt-4 px-4 py-2 rounded-lg border border-red-400 hover:bg-red-800 transition-colors"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Issue Title</h3>
            <div className="space-y-4">
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Enter a brief title for the issue"
                required
              />
            </div>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <h3 className="text-xl font-semibold mb-4">Issue Description</h3>
            <div className="space-y-4">
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
                placeholder="Please describe the issue in detail. Include any relevant information that will help us understand and resolve the problem."
                rows="6"
                required
              />
            </div>
          </div>

          <div className="bg-gray-700 p-6 rounded-lg">
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Report Issue'
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
