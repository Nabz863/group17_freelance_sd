import React, { useEffect, useState } from 'react';
import {
  fetchContractTemplate,
  listContracts,
  createContract,
  downloadContractPdf
} from '../services/contractAPI';

export default function ClientContracts() {
  const [template, setTemplate] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [form, setForm] = useState({
    projectId: '',
    title: '',
    freelancerId: '',
    contractSections: []
  });

  useEffect(() => {
    fetchContractTemplate().then(setTemplate);
    listContracts().then(setContracts);
  }, []);

  const handleSectionParam = (secIdx, param, value) => {
    setForm(f => {
      const secs = [...f.contractSections];
      secs[secIdx] = {
        ...secs[secIdx],
        parameters: { ...secs[secIdx].parameters, [param]: value }
      };
      return { ...f, contractSections: secs };
    });
  };

  const handleCreate = async () => {
    await createContract(form);
    setContracts(await listContracts());
  };

  if (!template) return <p>Loading template…</p>;

  useEffect(() => {
    setForm(f => ({
      ...f,
      contractSections: template.sections.map(s => ({
        title: s.title,
        content: s.content,
        parameters: {}
      }))
    }));
  }, [template]);

  return (
    <div>
      <h1>Create Contract</h1>
      <label>
        Project ID
        <input
          value={form.projectId}
          onChange={e => setForm(f => ({ ...f, projectId: e.target.value }))}
        />
      </label>
      <label>
        Title
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
        />
      </label>
      <label>
        Freelancer ID
        <input
          value={form.freelancerId}
          onChange={e => setForm(f => ({ ...f, freelancerId: e.target.value }))}
        />
      </label>

      {template.sections.map((sec, i) => (
        <div key={i}>
          <h3>{sec.title}</h3>
          <p>{sec.content}</p>
          {sec.editable && sec.parameters && Object.entries(sec.parameters).map(
            ([paramName, def]) => (
              <label key={paramName}>
                {paramName}
                <input
                  type={def.type === 'number' ? 'number' : 'text'}
                  onChange={e => handleSectionParam(i, paramName, e.target.value)}
                />
              </label>
            )
          )}
        </div>
      ))}

      <button onClick={handleCreate}>Send Contract</button>

      <h2>Your Contracts</h2>
      <ul>
        {contracts.map(c => (
          <li key={c.id}>
            {c.title} — {c.status}
            <button onClick={() => downloadContractPdf(c.id)}>Download PDF</button>
          </li>
        ))}
      </ul>
    </div>
  );
}