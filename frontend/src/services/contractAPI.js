import api from '../utils/api';

export async function fetchContractTemplate() {
  try {
    const { data } = await api.get('/contracts/template');
    // template comes back as { success: true, template: { sections: [...] } }
    return data.template.sections;
  } catch (err) {
    console.error('Error fetching contract template:', err);
    throw err;
  }
}

export async function createContract({ projectId, title, freelancerId, contractSections }) {
  const payload = { projectId, title, freelancerId };
  if (contractSections && contractSections.length) {
    payload.contractSections = contractSections;
  }
  const { data } = await api.post('/contracts', payload);
  return data.contract;
}

export async function listContracts() {
  const { data } = await api.get('/contracts');
  return data.contracts;
}

export async function updateContractStatus(contractId, status) {
  const { data } = await api.patch(`/contracts/${contractId}/status`, { status });
  return data.contract;
}

export function downloadContractPdf(contractId) {
  window.open(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/pdf`, '_blank');
}