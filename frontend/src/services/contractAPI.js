import API from '../utils/api';

// Fetch the default contract template
export async function fetchContractTemplate() {
  const { data } = await API.get('/contracts/template');
  if (data?.template?.sections) {
    return data.template.sections;
  } else {
    console.error('Invalid contract template response:', data);
    return [];
  }
}

// Create a new contract
export async function createContract({ projectId, title, freelancerId, contractSections }) {
  const payload = { projectId, title, freelancerId };
  if (contractSections?.length) payload.contractSections = contractSections;
  const { data } = await API.post('/contracts', payload);
  return data.contract;
}

// **NEW**: List all contracts (for client/freelancer dashboard)
export async function listContracts() {
  const { data } = await API.get('/contracts');
  return data.contracts;
}

// Update a contract’s status (accept/reject)
export async function updateContractStatus(contractId, status) {
  const { data } = await API.patch(`/contracts/${contractId}/status`, { status });
  return data.contract;
}

// Download the PDF for a given contract
export function downloadContractPdf(contractId) {
  window.open(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/pdf`, '_blank');
}
