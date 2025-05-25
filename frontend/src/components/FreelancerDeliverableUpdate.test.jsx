import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import FreelancerDeliverableUpdate from './FreelancerDeliverableUpdate';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('FreelancerDeliverableUpdate', () => {
  const mockUser = { sub: 'user-123' };
  const mockDeliverable = {
    id: 'deliverable-123',
    description: 'Initial deliverable description',
  };
  let mockDate;

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock Auth0
    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock Supabase
    supabase.from.mockImplementation((table) => {
      if (table === 'deliverables') {
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {};
    });

    // Mock Date for consistent timestamp
    mockDate = new Date('2025-05-25T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    // Debug mock setup
    console.log('Supabase mock setup:', supabase.from.mockImplementation);
  });

  afterEach(() => {
    jest.spyOn(global, 'Date').mockRestore();
  });

  it('renders form with correct elements and pre-filled description', () => {
    render(<FreelancerDeliverableUpdate deliverable={mockDeliverable} />);

    expect(screen.getByText('Update Deliverable')).toBeInTheDocument();
    expect(screen.getByLabelText('Updated Deliverable Description')).toBeInTheDocument();
    const textarea = screen.getByPlaceholderText('Enter your updated deliverable description...');
    expect(textarea).toBeInTheDocument();
    expect(textarea).toHaveValue(mockDeliverable.description);
    expect(screen.getByRole('button', { name: 'Update Deliverable' })).toBeInTheDocument();
  });

  it('updates description on textarea input', () => {
    render(<FreelancerDeliverableUpdate deliverable={mockDeliverable} />);

    const textarea = screen.getByPlaceholderText('Enter your updated deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });

    expect(textarea).toHaveValue('Updated description');
  });

  it('submits form successfully and calls Supabase update', async () => {
    render(<FreelancerDeliverableUpdate deliverable={mockDeliverable} />);

    const textarea = screen.getByPlaceholderText('Enter your updated deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });

    const submitButton = screen.getByRole('button', { name: 'Update Deliverable' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deliverables');
      expect(supabase.from().update).toHaveBeenCalledWith({
        description: 'Updated description',
        submitted_by: mockUser.sub,
        submitted_at: mockDate.toISOString(),
      });
      expect(supabase.from().update().eq).toHaveBeenCalledWith('id', {
        type: 'uuid',
        value: mockDeliverable.id,
      });
      expect(screen.queryByText('Failed to update deliverable. Please try again.')).not.toBeInTheDocument();
    }, { timeout: 5000 });
  });

  it('displays error on submission failure', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'deliverables') {
        return {
          update: jest.fn().mockReturnThis(),
          eq: jest.fn().mockResolvedValue({ data: null, error: new Error('Update failed') }),
        };
      }
      return {};
    });

    render(<FreelancerDeliverableUpdate deliverable={mockDeliverable} />);

    const textarea = screen.getByPlaceholderText('Enter your updated deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });

    const submitButton = screen.getByRole('button', { name: 'Update Deliverable' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to update deliverable. Please try again.')).toBeInTheDocument();
      expect(textarea).toHaveValue('Updated description'); // Description not reset on error
    }, { timeout: 5000 });
  });

  it('disables submit button when loading', async () => {
    render(<FreelancerDeliverableUpdate deliverable={mockDeliverable} />);

    const textarea = screen.getByPlaceholderText('Enter your updated deliverable description...');
    fireEvent.change(textarea, { target: { value: 'Updated description' } });

    const submitButton = screen.getByRole('button', { name: 'Update Deliverable' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toHaveTextContent('Updating...');
      expect(submitButton).toBeDisabled();
    }, { timeout: 5000 });
  });

  it('disables submit button when description is empty', () => {
    render(<FreelancerDeliverableUpdate deliverable={mockDeliverable} />);

    const textarea = screen.getByPlaceholderText('Enter your updated deliverable description...');
    fireEvent.change(textarea, { target: { value: '' } });

    const submitButton = screen.getByRole('button', { name: 'Update Deliverable' });
    expect(submitButton).toBeDisabled();

    fireEvent.change(textarea, { target: { value: 'Updated description' } });
    expect(submitButton).not.toBeDisabled();
  });
});