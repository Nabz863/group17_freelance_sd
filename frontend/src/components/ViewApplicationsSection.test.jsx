import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ViewApplicationsSection from './ViewApplicationsSection';

jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('ViewApplicationsSection', () => {
  const mockUser = { sub: 'user-1' };
  const mockJobs = [
    {
      id: 'proj-1',
      description: JSON.stringify({
        title: 'Job A',
        details: 'Details for Job A',
      }),
      freelancer_id: null,
      applications: [
        {
          freelancerid: 'alice-id',
          status: 'pending',
          coverletter: 'Cover letter from Alice',
          freelancer: {
            profile: JSON.stringify({
              firstName: 'Alice',
              lastName: 'Smith',
              profession: 'Developer',
              email: 'alice@example.com',
            }),
          },
        },
        {
          freelancerid: 'bob-id',
          status: 'pending',
          coverletter: 'Cover letter from Bob',
          freelancer: {
            profile: JSON.stringify({
              firstName: 'Bob',
              lastName: 'Jones',
              profession: 'Designer',
              email: 'bob@example.com',
            }),
          },
        },
      ],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          select: jest.fn().mockImplementation((fields) => {
            if (fields.includes('applications')) {
              return {
                eq: jest.fn().mockResolvedValue({
                  data: mockJobs,
                  error: null,
                }),
              };
            }
            return {};
          }),
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }
      return {};
    });

    // Debug mock calls
    console.log('Supabase mock setup:', supabase.from.mockImplementation);
    console.log('Mock jobs:', JSON.stringify(mockJobs, null, 2));
  });

  it('renders applicants and handles assign action', async () => {
    render(<ViewApplicationsSection />);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText('Bob Jones')).toBeInTheDocument();
      expect(screen.getByText('alice@example.com')).toBeInTheDocument();
      expect(screen.getByText('bob@example.com')).toBeInTheDocument();
    }, { timeout: 5000 }); // Increase to 10000 if timeout persists

    const assignButtons = screen.getAllByRole('button', { name: 'Assign Freelancer' });
    expect(assignButtons).toHaveLength(2);

    fireEvent.click(assignButtons[0]);
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(supabase.from().update).toHaveBeenCalledWith({ freelancer_id: 'alice-id' });
      expect(supabase.from().eq).toHaveBeenCalledWith('id', 'proj-1');
    }, { timeout: 5000 });
  });

  it('hides the list when "Hide Applicants" is clicked', async () => {
    render(<ViewApplicationsSection />);

    await waitFor(() => {
      expect(screen.getByText('Job A')).toBeInTheDocument();
    }, { timeout: 5000 });

    const viewButton = screen.getByRole('button', { name: 'View Applicants' });
    fireEvent.click(viewButton);

    await waitFor(() => {
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    }, { timeout: 5000 });

    const hideButton = screen.getByRole('button', { name: 'Hide Applicants' });
    fireEvent.click(hideButton);

    await waitFor(() => {
      expect(screen.queryByText('Alice Smith')).not.toBeInTheDocument();
      expect(screen.queryByText('Bob Jones')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });
});