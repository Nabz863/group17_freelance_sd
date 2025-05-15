import React, { useState } from 'react';
import axios from 'axios';
import '../styles/deliverables.css';

const DeliverableApproval = ({ deliverable }) => {
  const [isApproving, setIsApproving] = useState(false);
  const [revisionComments, setRevisionComments] = useState('');

  const handleApproval = async (action) => {
    setIsApproving(true);

    try {
      await axios.patch(`/api/deliverables/${deliverable._id}`, {
        action,
        ...(action === 'revision' ? { comments: revisionComments } : {}),
      });

      // Refresh the page after approval
      window.location.reload();
    } catch (error) {
      console.error('Error processing deliverable:', error);
      alert('Failed to process deliverable. Please try again.');
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="deliverable-approval">
      <h3>Deliverable {deliverable.milestoneNumber}</h3>
      <div className="deliverable-status">
        <span className={`status-${deliverable.status}`}>
          {deliverable.status.replace('_', ' ')}
        </span>
      </div>

      <div className="deliverable-details">
        <p><strong>Description:</strong> {deliverable.description}</p>
        <div className="files-list">
          <h4>Attached Files:</h4>
          <ul>
            {deliverable.files?.map((file) => (
              <li key={file._id}>
                <a href={`/api/files/${file._id}`} target="_blank" rel="noopener noreferrer">
                  {file.originalname}
                </a>
              </li>
            ))}
          </ul>
        </div>

        {deliverable.revisionComments && (
          <div className="revision-comments">
            <h4>Revision Comments:</h4>
            <p>{deliverable.revisionComments}</p>
          </div>
        )}

        {deliverable.status === 'pending' && (
          <div className="approval-actions">
            <button
              onClick={() => handleApproval('approve')}
              disabled={isApproving}
              className="btn btn-success"
            >
              {isApproving ? 'Approving...' : 'Approve'}
            </button>

            <div className="revision-form">
              <textarea
                value={revisionComments}
                onChange={(e) => setRevisionComments(e.target.value)}
                placeholder="Enter revision comments..."
                className="form-control"
              />
              <button
                onClick={() => handleApproval('revision')}
                disabled={isApproving}
                className="btn btn-warning"
              >
                {isApproving ? 'Requesting Revision...' : 'Request Revision'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DeliverableApproval;
