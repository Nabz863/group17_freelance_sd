import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import supabase from '../utils/supabaseClient';
import ClientCompletionTracking from './ClientCompletionTracking';

jest.mock('../utils/supabaseClient');

describe('ClientCompletionTracking component', () => {
  const mockProjectId = 'proj-123';
  const mockMilestones = [
    { id: 'ms-123', title: 'Milestone 1', completed: false },
    { id: 'ms-124', title: 'Milestone 2', completed: true },
  ];
  const mockProps = { projectId: mockProjectId, milestones: mockMilestones };

  beforeEach(() => {
    jest.clearAllMocks();
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
  });

  it('renders correctly with milestones', () => {
    render(<ClientCompletionTracking {...mockProps} />);
    
    expect(screen.getByText('Completion Tracking')).toBeInTheDocument();
    expect(screen.getByText('Project Completion')).toBeInTheDocument();
    expect(screen.getByText('50% Complete')).toBeInTheDocument();
    expect(screen.getByText('Milestone 1')).toBeInTheDocument();
    expect(screen.getByText('Milestone 2')).toBeInTheDocument();
  });

  it('disables project completion button when not 100% complete', () => {
    render(<ClientCompletionTracking {...mockProps} />);
    
    const projectButton = screen.getByRole('button', { name: 'Mark Project Complete' });
    expect(projectButton).toBeDisabled();
  });

  it('handles milestone completion toggle', async () => {
    render(<ClientCompletionTracking {...mockProps} />);
    
    const milestoneButton = screen.getByRole('button', { name: 'Mark Complete' });
    fireEvent.click(milestoneButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('milestones');
      expect(supabase.from().update).toHaveBeenCalledWith({
        completed: true,
        completed_at: expect.any(String),
      });
    });
  });

  it('handles project completion', async () => {
    const allCompleteMilestones = mockMilestones.map(m => ({ ...m, completed: true }));
    render(<ClientCompletionTracking {...mockProps} milestones={allCompleteMilestones} />);
    
    const projectButton = screen.getByRole('button', { name: 'Mark Project Complete' });
    fireEvent.click(projectButton);
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('projects');
      expect(supabase.from().update).toHaveBeenCalledWith({
        completed: true,
        completed_at: expect.any(String),
      });
    });
  });

  it('displays error on failed Supabase update', async () => {
    supabase.from.mockReturnValue({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: new Error('Update failed') }),
    });
    
    render(<ClientCompletionTracking {...mockProps} />);
    
    const milestoneButton = screen.getByRole('button', { name: 'Mark Complete' });
    fireEvent.click(milestoneButton);
    
    await waitFor(() => {
      expect(screen.getByText('Failed to update milestone. Please try again.')).toBeInTheDocument();
    });
  });
});