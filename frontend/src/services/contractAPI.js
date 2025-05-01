import axios from 'axios';

export async function fetchContractTemplate() {
  const { data } = await axios.get('/api/contracts/template');
  return data.template;
}

export async function listContracts() {
  const { data } = await axios.get('/api/contracts');
  return data.contracts;
}

export async function createContract({ projectId, title, freelancerId, contractSections }) {
  const { data } = await axios.post('/api/contracts', {
    projectId, title, freelancerId, contractSections
  });
  return data.contract;
}

export async function updateContractStatus(contractId, status) {
  const { data } = await axios.patch(`/api/contracts/${contractId}/status`, { status });
  return data.contract;
}

export function downloadContractPdf(contractId) {
  window.open(`/api/contracts/${contractId}/pdf`, '_blank');
}