import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ApplyJobSection from './ApplyJobSection';

jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('ApplyJobSection', () => {
  const mockUser = { sub: 'user-1' };
  const mockProject = {
    id: 'proj-123',
    description: JSON.stringify({
      title: 'Test Job',
      details: 'Test details',
      requirements: 'Reqs',
      budget: 500,
      deadline: '2025-05-01',
    }),
    created_at: '2025-01-01',
    freelancer_id: null,
    completed: false,
    clients: { id: 'client-1', name: 'Test Client' }, // Mock clients join
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock alert
    global.alert = jest.fn();
    
    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          select: jest.fn().mockImplementation((fields) => {
            if (fields === 'id, description, created_at, clients!inner(*)') {
              return {
                is: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                  data: [mockProject],
                  error: null,
                }),
              };
            }
            return {};
          }),
        };
      }
      if (table === 'applications') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          cast: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
          insert: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });

    // Debug mock calls
    console.log('Supabase mock setup:', supabase.from.mockImplementation);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('does not fetch jobs when user is not logged in', () => {
    useAuth0.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
    render(<ApplyJobSection />);
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it('renders job details correctly', async () => {
    render(<ApplyJobSection />);
    await waitFor(() => {
      expect(screen.getByText('Test Job')).toBeInTheDocument();
      expect(screen.getByText('Test details')).toBeInTheDocument();
      expect(screen.getByText('Requirements: Reqs')).toBeInTheDocument();
      expect(screen.getByText('Budget: R500')).toBeInTheDocument();
      expect(screen.getByText('Deadline: 2025-05-01')).toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('handles apply button click with error', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          select: jest.fn().mockImplementation((fields) => {
            if (fields === 'id, description, created_at, clients!inner(*)') {
              return {
                is: jest.fn().mockReturnThis(),
                eq: jest.fn().mockReturnValue({
                  data: [mockProject],
                  error: null,
                }),
              };
            }
            return {};
          }),
        };
      }
      if (table === 'applications') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          cast: jest.fn().mockReturnValue({
            data: [],
            error: null,
          }),
          insert: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({ error: new Error('Apply failed') }),
        };
      }
      return {};
    });

    render(<ApplyJobSection />);
    await waitFor(() => screen.getByText('Test Job'), { timeout: 5000 });

    const applyButton = screen.getByRole('button', { name: 'Apply Now' });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith('Failed to apply. Try again.');
    }, { timeout: 5000 });
  });
});