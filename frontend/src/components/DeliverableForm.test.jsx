import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import DeliverableForm from './DeliverableForm';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('DeliverableForm', () => {
  const mockUser = { sub: 'user-123' };
  const mockProjectId = 'proj-123';
  const mockMilestone = { number: 1 };

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    supabase.from.mockImplementation((table) => {
      if (table === 'deliverables') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {};
    });

    // Debug mock setup
    console.log('Supabase mock setup:', supabase.from.mockImplementation);
  });

  it('renders form with correct elements', () => {
    render(<DeliverableForm projectId={mockProjectId} milestone={mockMilestone} />);

    expect(screen.getAllByText('Submit Deliverable')).toHaveLength(2); // h3 and button
    expect(screen.getByLabelText('Deliverable Description')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your deliverable description...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Submit Deliverable' })).toBeInTheDocument();
  });

  it('updates description on textarea input', () => {
    render(<DeliverableForm projectId={mockProjectId} milestone={mockMilestone} />);

    const textarea = screen.getByPlaceholderText('Enter your deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Test deliverable' } });

    expect(textarea).toHaveValue('Test deliverable');
  });

  it('submits form successfully and resets description', async () => {
    render(<DeliverableForm projectId={mockProjectId} milestone={mockMilestone} />);

    const textarea = screen.getByPlaceholderText('Enter your deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Test deliverable' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Deliverable' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deliverables');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        contract_id: { type: 'uuid', value: mockProjectId },
        milestone_number: mockMilestone.number,
        description: 'Test deliverable',
        submitted_by: mockUser.sub,
        status: 'pending',
      });
      expect(textarea).toHaveValue('');
    }, { timeout: 5000 }); // Increase to 10000 if timeout persists
  });

  it('displays error on submission failure', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'deliverables') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
        };
      }
      return {};
    });

    render(<DeliverableForm projectId={mockProjectId} milestone={mockMilestone} />);

    const textarea = screen.getByPlaceholderText('Enter your deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Test deliverable' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Deliverable' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to submit deliverable. Please try again.')).toBeInTheDocument();
      expect(textarea).toHaveValue('Test deliverable'); // Description not reset on error
    }, { timeout: 5000 }); // Increase to 10000 if timeout persists
  });

  it('disables submit button when loading', async () => {
    render(<DeliverableForm projectId={mockProjectId} milestone={mockMilestone} />);

    const textarea = screen.getByPlaceholderText('Enter your deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Test deliverable' } });

    const submitButton = screen.getByRole('button', { name: 'Submit Deliverable' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Submitting...');
      expect(submitButton).toBeDisabled();
    }, { timeout: 5000 });
  });

  it('disables submit button when description is empty', () => {
    render(<DeliverableForm projectId={mockProjectId} milestone={mockMilestone} />);

    const submitButton = screen.getByRole('button', { name: 'Submit Deliverable' });
    expect(submitButton).toBeDisabled();

    const textarea = screen.getByPlaceholderText('Enter your deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Test deliverable' } });

    expect(submitButton).not.toBeDisabled();
  });
});