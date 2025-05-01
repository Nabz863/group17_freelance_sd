import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import ViewApplicationsSection from './ViewApplicationsSection';
import supabase from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient');

describe('ViewApplicationsSection', () => {
  const mockApps = [
    {
      id: '1',
      job_title: 'Job A',
      job_location: 'Location A',
      applicant: {
        user_id: 'alice-id',
        firstName: 'Alice',
        lastName: 'Smith',
        profession: 'Developer',
        email: 'alice@example.com'
      }
    },
    {
      id: '2',
      job_title: 'Job A',
      job_location: 'Location A',
      applicant: {
        user_id: 'bob-id',
        firstName: 'Bob',
        lastName: 'Jones',
        profession: 'Designer',
        email: 'bob@example.com'
      }
    }
  ];

  beforeEach(() => {
    supabase.from.mockReturnValue({
      select: () => ({
        eq: () => Promise.resolve({ data: mockApps, error: null })
      })
    });
  });

  it('renders applicants and handles assign action', async () => {
    const handleAssign = jest.fn();
    render(<ViewApplicationsSection projectId="proj1" onAssign={handleAssign} />);

    await waitFor(() => {
      expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument();
      expect(screen.getByText(/bob@example\.com/i)).toBeInTheDocument();
    });

    const assignButtons = screen.getAllByRole('button', { name: /Assign Freelancer/i });
    expect(assignButtons).toHaveLength(2);

    fireEvent.click(assignButtons[0]);
    expect(handleAssign).toHaveBeenCalledWith('alice-id');
  });

  it('hides the list when "Hide Applicants" is clicked', async () => {
    render(<ViewApplicationsSection projectId="proj1" onAssign={() => {}} />);

    const hideBtn = await screen.findByRole('button', { name: /Hide Applicants/i });
    fireEvent.click(hideBtn);

    expect(screen.queryByText(/Alice Smith/i)).toBeNull();
    expect(screen.queryByText(/Bob Jones/i)).toBeNull();
  });
});