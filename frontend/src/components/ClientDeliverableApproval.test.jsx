import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ClientDeliverableApproval from './ClientDeliverableApproval';

jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('ClientDeliverableApproval component', () => {
  const mockUser = { sub: 'user-123' };
  const mockDeliverable = { id: 'deliv-123', status: 'pending' };
  const mockProjectId = 'proj-123';
  const mockProps = {
    deliverable: mockDeliverable,
    projectId: mockProjectId,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({ user: mockUser });
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: null }),
      }),
    });
  });

  it('renders correctly with pending deliverable', () => {
    render(<ClientDeliverableApproval {...mockProps} />);
    
    expect(screen.getByText('Deliverable Actions')).toBeInTheDocument();
    expect(screen.getByText('Revision Comments (if requesting revision)')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Approve' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Request Revision' })).toBeInTheDocument();
  });

  it('disables buttons when loading', async () => {
    render(<ClientDeliverableApproval {...mockProps} />);
    
    const approveButton = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveButton);
    
    expect(screen.getByRole('button', { name: 'Approving...' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Requesting Revision...' })).toBeDisabled();
  });

  it('handles approval correctly', async () => {
    render(<ClientDeliverableApproval {...mockProps} />);
    
    const approveButton = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deliverables');
      expect(supabase.from().update).toHaveBeenCalledWith({
        status: 'approved',
        approved_by: mockUser.sub,
        approved_at: expect.any(String),
        revision_comments: null,
      });
    });
  });

  it('handles revision request with comments', async () => {
    render(<ClientDeliverableApproval {...mockProps} />);
    
    const textarea = screen.getByPlaceholderText('Enter your revision comments...');
    fireEvent.change(textarea, { target: { value: 'Needs changes' } });
    
    const revisionButton = screen.getByRole('button', { name: 'Request Revision' });
    fireEvent.click(revisionButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('deliverables');
      expect(supabase.from().update).toHaveBeenCalledWith({
        status: 'revision_requested',
        approved_by: null,
        approved_at: null,
        revision_comments: 'Needs changes',
      });
    });
  });

  it('displays error on failed Supabase update', async () => {
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnValue({
        eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
      }),
    });
    
    render(<ClientDeliverableApproval {...mockProps} />);
    
    const approveButton = screen.getByRole('button', { name: 'Approve' });
    fireEvent.click(approveButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to update deliverable. Please try again.')).toBeInTheDocument();
    });
  });
});