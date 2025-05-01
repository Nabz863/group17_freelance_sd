import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewApplicationsSection from './ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

// stub supabaseClient globally
jest.mock('../utils/supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn() },
}));

describe('ViewApplicationsSection', () => {
  const mockApplications = [
    {
      applicationid: 'a1',
      job_title: 'Job A',
      freelancer: {
        user_id: 'alice-id',
        firstName: 'Alice',
        lastName: 'Smith',
        profession: 'Developer',
        email: 'alice@example.com',
        name: 'Alice Smith',
      },
    },
    {
      applicationid: 'a2',
      job_title: 'Job A',
      freelancer: {
        user_id: 'bob-id',
        firstName: 'Bob',
        lastName: 'Jones',
        profession: 'Designer',
        email: 'bob@example.com',
        name: 'Bob Jones',
      },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders "No applications yet." when there are none', async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ data: [], error: null }),
      }),
    });

    render(<ViewApplicationsSection projectId="pj1" onAssign={() => {}} />);
    await waitFor(() =>
      expect(screen.getByText(/No applications yet\./i)).toBeInTheDocument()
    );
  });

  it('renders applications and calls onAssign', async () => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ data: mockApplications, error: null }),
      }),
    });

    const handleAssign = jest.fn();
    render(
      <ViewApplicationsSection projectId="pj1" onAssign={handleAssign} />
    );

    // wait for the unique email to appear
    await waitFor(() =>
      expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument()
    );

    // check both applicants
    expect(screen.getByText(/Developer/i)).toBeInTheDocument();
    expect(screen.getByText(/Bob Jones/i)).toBeInTheDocument();
    expect(screen.getByText(/Designer/i)).toBeInTheDocument();

    // click the first "Assign Freelancer" button
    const assignButtons = screen.getAllByRole('button', {
      name: /Assign Freelancer/i,
    });
    fireEvent.click(assignButtons[0]);
    expect(handleAssign).toHaveBeenCalledWith('alice-id');
  });

  it('hides the list when "Hide Applicants" is clicked', async () => {
    // *** critical: stub in data again so the Hide button actually renders ***
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ data: mockApplications, error: null }),
      }),
    });

    render(
      <ViewApplicationsSection projectId="pj1" onAssign={() => {}} />
    );

    // wait for heading and first email
    await waitFor(() => screen.getByText(/alice@example\.com/i));

    // now the Hide button should exist
    const hideBtn = screen.getByRole('button', { name: /Hide Applicants/i });
    fireEvent.click(hideBtn);

    // the entire section should unmount
    expect(screen.queryByText(/Job Applications/i)).toBeNull();
  });
});
