import React, { useState, useEffect } from 'react';
import supabase from '../utils/supabaseClient';

export default function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const channel = supabase
      .channel('issues')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'issues'
        },
        (payload) => {
          console.log('Change received:', payload);
          fetchIssues();
        }
      )
      .subscribe();

    fetchIssues();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchIssues = async () => {
    try {
      const { data, error } = await supabase
        .from('issues')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIssues(data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching issues:', err);
      setError('Failed to fetch issues. Please try again.');
      setLoading(false);
    }
  };

  const handleStatusChange = async (issueId, newStatus) => {
    try {
      const { error } = await supabase
        .from('issues')
        .update({ status: newStatus })
        .eq('id', issueId);

      if (error) throw error;
      fetchIssues();
    } catch (err) {
      console.error('Error updating issue status:', err);
      setError('Failed to update issue status. Please try again.');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'resolved':
        return 'bg-green-500';
      case 'rejected':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const handleViewDetails = (issue) => {
    setSelectedIssue(issue);
    setShowDetails(true);
  };

  const handleCloseDetails = () => {
    setSelectedIssue(null);
    setShowDetails(false);
  };

  if (loading) return <div>Loading issues...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Issues</h1>
      <div className="bg-white rounded-lg shadow-lg p-4">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2">Title</th>
                <th className="text-left py-2">Reporter</th>
                <th className="text-left py-2">Reported</th>
                <th className="text-left py-2">Status</th>
                <th className="text-left py-2">Created</th>
                <th className="text-left py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {issues.map((issue) => (
                <tr key={issue.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">
                    <button
                      onClick={() => handleViewDetails(issue)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      {issue.title}
                    </button>
                  </td>
                  <td className="py-2">{issue.reporter_id}</td>
                  <td className="py-2">{issue.reported_id}</td>
                  <td className="py-2">
                    <span
                      className={`px-2 py-1 rounded-full text-white ${getStatusColor(issue.status)}`}
                    >
                      {issue.status}
                    </span>
                  </td>
                  <td className="py-2">{new Date(issue.created_at).toLocaleDateString()}</td>
                  <td className="py-2">
                    <select
                      value={issue.status}
                      onChange={(e) => handleStatusChange(issue.id, e.target.value)}
                      className="border rounded px-2 py-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="resolved">Resolved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showDetails && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Issue Details</h2>
              <button
                onClick={handleCloseDetails}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold">Title:</h3>
                <p>{selectedIssue.title}</p>
              </div>
              <div>
                <h3 className="font-semibold">Description:</h3>
                <p>{selectedIssue.description}</p>
              </div>
              <div>
                <h3 className="font-semibold">Reporter ID:</h3>
                <p>{selectedIssue.reporter_id}</p>
              </div>
              <div>
                <h3 className="font-semibold">Reported ID:</h3>
                <p>{selectedIssue.reported_id}</p>
              </div>
              <div>
                <h3 className="font-semibold">Status:</h3>
                <span
                  className={`px-2 py-1 rounded-full text-white ${getStatusColor(selectedIssue.status)}`}
                >
                  {selectedIssue.status}
                </span>
              </div>
              <div>
                <h3 className="font-semibold">Created At:</h3>
                <p>{new Date(selectedIssue.created_at).toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
