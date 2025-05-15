import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FileUpload } from './FileUpload';
import '../styles/deliverables.css';

const DeliverableForm = ({ contractId, milestoneNumber, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const formData = new FormData();
      files.forEach((file, index) => {
        formData.append('files', file);
      });

      // Upload files first
      const uploadResponse = await axios.post('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Submit deliverable with file IDs
      const deliverableResponse = await axios.post(
        `/api/deliverables/${contractId}/milestone/${milestoneNumber}`,
        {
          description,
          files: uploadResponse.data.fileIds,
        }
      );

      onSubmit(deliverableResponse.data.deliverable);
      navigate(`/contracts/${contractId}`);
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      alert('Failed to submit deliverable. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="deliverable-form">
      <h2>Submit Deliverable for Milestone {milestoneNumber}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="form-control"
            rows="4"
          />
        </div>

        <div className="form-group">
          <label>Files</label>
          <FileUpload
            onFilesSelected={setFiles}
            multiple
            accept="*"
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            disabled={isLoading}
            className="btn btn-primary"
          >
            {isLoading ? 'Submitting...' : 'Submit Deliverable'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DeliverableForm;
