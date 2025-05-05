const supabase = require('../utils/supabaseClient');
const { generateAndStoreContractPdf } = require('./pdfGenerator');
const { getContractTemplate } = require('../models/contractTemplate');

async function createContract({ projectId, title, clientId, freelancerId, contractSections }) {
  const { data: inserted, error: insertErr } = await supabase
    .from('contracts')
    .insert({
      project_id: projectId,
      title,
      client_id: clientId,
      freelancer_id: freelancerId,
      contract_sections: contractSections,
      status: 'pending'
    })
    .select()
    .single();
  if (insertErr) throw insertErr;

  const formal = {
    id: inserted.id,
    title: inserted.title,
    parties: { client: inserted.client_id, freelancer: inserted.freelancer_id },
    sections: inserted.contract_sections.map((sec) => {
      const formatted = sec.parameters
        ? Object.entries(sec.parameters).reduce(
            (acc, [k, v]) => acc.replace(`{${k}}`, v),
            sec.content
          )
        : sec.content;
      return { title: sec.title, content: sec.content, formattedContent: formatted };
    }),
    createdAt: inserted.created_at
  };

  const pdfUrl = await generateAndStoreContractPdf(formal);

  const { data: updated, error: updateErr } = await supabase
    .from('contracts')
    .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
    .eq('id', inserted.id)
    .select()
    .single();
  if (updateErr) throw updateErr;

  return updated;
}

async function getContractById(contractId) {
  const { data, error } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', contractId)
    .single();
  if (error) throw error;
  return data;
}

async function updateContractStatus(contractId, status) {
  const { data, error } = await supabase
    .from('contracts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', contractId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

async function generateFormalContract(contractId) {
  const contract = await getContractById(contractId);
  if (!contract) throw new Error('Contract not found');

  const formal = {
    id: contract.id,
    title: contract.title,
    parties: { client: contract.client_id, freelancer: contract.freelancer_id },
    sections: contract.contract_sections.map((sec) => {
      const formatted = sec.parameters
        ? Object.entries(sec.parameters).reduce(
            (acc, [k, v]) => acc.replace(`{${k}}`, v),
            sec.content
          )
        : sec.content;
      return { title: sec.title, content: sec.content, formattedContent: formatted };
    }),
    createdAt: contract.created_at,
    updatedAt: contract.updated_at
  };

  return formal;
}

module.exports = {
  createContract,
  getContractById,
  updateContractStatus,
  generateFormalContract
};