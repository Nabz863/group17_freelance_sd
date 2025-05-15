import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeliverableApproval from './DeliverableApproval';
import DeliverableForm from './DeliverableForm';
import '../styles/deliverables.css';

const DeliverablesList = ({ contractId, role }) => {
  const [deliverables, setDeliverables] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeliverables = async () => {
      try {
        const response = await axios.get(`/api/deliverables/${contractId}`);
        setDeliverables(response.data.deliverables);
      } catch (error) {
        console.error('Error fetching deliverables:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeliverables();
  }, [contractId]);

  const handleNewDeliverable = (newDeliverable) => {
    setDeliverables((prev) => [...prev, newDeliverable]);
  };

  if (loading) {
    return <div>Loading deliverables...</div>;
  }

  return (
    <div className="deliverables-list">
      <h2>Contract Deliverables</h2>

      {role === 'freelancer' && (
        <div className="new-deliverable">
          <h3>Submit New Deliverable</h3>
          <DeliverableForm
            contractId={contractId}
            milestoneNumber={deliverables.length + 1}
            onSubmit={handleNewDeliverable}
          />
        </div>
      )}

      <div className="deliverables-grid">
        {deliverables.map((deliverable) => (
          <div key={deliverable._id} className="deliverable-card">
            <DeliverableApproval deliverable={deliverable} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DeliverablesList;
