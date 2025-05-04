import API from '../utils/api';

export async function fetchContractTemplate() {
  const { data } = await API.get('/contracts/template');
  if (data?.template?.sections) {
    return data.template.sections;
  } else {
    console.error('Invalid contract template response:', data);
    return [];
  }
}

export async function createContract({ projectId, title, freelancerId, contractSections }) {
  const payload = { projectId, title, freelancerId };
  if (contractSections?.length) payload.contractSections = contractSections;
  const { data } = await API.post('/contracts', payload);
  return data.contract;
}

export async function updateContractStatus(contractId, status) {
  const { data } = await API.patch(`/contracts/${contractId}/status`, { status });
  return data.contract;
}

export function downloadContractPdf(contractId) {
  window.open(`${process.env.REACT_APP_API_URL}/api/contracts/${contractId}/pdf`, '_blank');
}
