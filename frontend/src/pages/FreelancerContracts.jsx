import React, { useEffect, useState } from 'react';
import {
  listContracts,
  updateContractStatus,
  downloadContractPdf
} from '../services/contractAPI';
import DeliverablesList from '../components/DeliverablesList';

export default function FreelancerContracts() {
  const [contracts, setContracts] = useState([]);

  useEffect(() => {
    listContracts().then(setContracts);
  }, []);

  const respond = async (id, status) => {
    await updateContractStatus(id, status);
    setContracts(await listContracts());
  };

  return (
    <div>
      <h1>Pending Contracts</h1>
      <ul>
        {contracts
          .filter(c => c.status === 'pending')
          .map(c => (
            <li key={c.id}>
              {c.title}
              <button onClick={() => downloadContractPdf(c.id)}>
                View PDF
              </button>
              <button onClick={() => respond(c.id, 'accepted')}>
                Accept
              </button>
              <button onClick={() => respond(c.id, 'rejected')}>
                Reject
              </button>
              <DeliverablesList contractId={c.id} role="freelancer" />
            </li>
          ))}
      </ul>
    </div>
  );
}