import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewApplicationsSection from './ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn() }
}));

describe('ViewApplicationsSection', () => {
  const mockApplications = [
    {
      id: 'app1',
      job_title: 'Job B',
      applicant: {
        user_id: 'u1',
        firstName: 'Alice',
        lastName: 'Smith',
        profession: 'Developer',
        email: 'alice@example.com'
      }
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ data: mockApplications })
      })
    });
  });

  it('renders applicants and handles assign action', async () => {
    const handleAssign = jest.fn();
    render(<ViewApplicationsSection jobId="j1" onAssign={handleAssign} />);

    await waitFor(() => screen.getByText(/Alice Smith/i));

    const assignBtn = screen.getByRole('button', { name: /Assign Freelancer/i });
    expect(assignBtn).toBeInTheDocument();

    fireEvent.click(assignBtn);
    expect(handleAssign).toHaveBeenCalledWith('u1');
  });
});