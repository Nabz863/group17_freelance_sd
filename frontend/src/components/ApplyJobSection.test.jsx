import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ApplyJobSection from './ApplyJobSection';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: jest.fn(),
  },
}));

jest.mock('@auth0/auth0-react');

describe('ApplyJobSection', () => {
  beforeAll(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterAll(() => {
    console.warn.mockRestore();
    console.error.mockRestore();
  });

  let realCrypto;
  beforeAll(() => {
    realCrypto = global.crypto;
    global.crypto = { randomUUID: () => 'uuid-1234' };
  });
  afterAll(() => {
    global.crypto = realCrypto;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({ user: { sub: 'user-1' } });
  });
  function mockSupabase({ projectsResp, appsResp, insertResp }) {
    const builderProjects = {
      select: jest.fn(() => builderProjects),
      is:     jest.fn(() => builderProjects),
      eq:     jest.fn(() => builderProjects),
      then:  cb => cb(projectsResp),
    };
    const builderInsert = { then: cb => cb(insertResp) };
    const builderApps = {
      select: jest.fn(() => builderApps),
      eq:     jest.fn(() => builderApps),
      then:  cb => cb(appsResp),
      insert: jest.fn(() => builderInsert),
    };

    supabase.from.mockImplementation(table => {
      if (table === 'projects')     return builderProjects;
      if (table === 'applications') return builderApps;
      throw new Error(`Unexpected table: ${table}`);
    });
  }

  it('shows loading then empty-state when no jobs', async () => {
    mockSupabase({
      projectsResp: { data: [], error: null },
      appsResp:     { data: [], error: null },
      insertResp:   { error: null },
    });

    render(<ApplyJobSection />);
    expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();

    await screen.findByText(/No jobs available right now\./i);
  });

  it('shows error message when fetch fails', async () => {
    mockSupabase({
      projectsResp: { data: null, error: new Error('fail') },
      appsResp:     { data: [],  error: null },
      insertResp:   { error: null },
    });

    render(<ApplyJobSection />);
    await screen.findByText(/Failed to load jobs\. Please try again later\./i);
  });

  it('renders a job card and applies successfully', async () => {
    const proj = {
      id: 1,
      description: JSON.stringify({
        title: 'Test Job',
        details: 'Test details',
        requirements: 'Reqs',
        budget: 500,
        deadline: '2025-05-01',
      }),
    };
    mockSupabase({
      projectsResp: { data: [proj], error: null },
      appsResp:     { data: [],     error: null },
      insertResp:   { error: null },
    });

    render(<ApplyJobSection />);
    await screen.findByText('Test Job');

    fireEvent.click(screen.getByRole('button', { name: /Apply Now/i }));

    expect(supabase.from).toHaveBeenCalledWith('applications');
    expect(
      await screen.findByRole('button', { name: /Application Submitted/i })
    ).toBeDisabled();
  });

  it('handles invalid JSON in description gracefully', async () => {
    mockSupabase({
      projectsResp: { data: [{ id: 3, description: 'not-json' }], error: null },
      appsResp:     { data: [], error: null },
      insertResp:   { error: null },
    });

    render(<ApplyJobSection />);
    await waitFor(() => {
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('');
    });
  });
});