import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import supabase from '../utils/supabaseClient';
import AdminIssues from './AdminIssues';

jest.mock('../utils/supabaseClient');

describe('AdminIssues component', () => {
  const mockIssues = [
    {
      id: 'issue-123',
      title: 'Test Issue',
      reporter_id: 'user-1',
      reported_id: 'user-2',
      status: 'pending',
      created_at: '2025-01-01',
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    supabase.from = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockIssues, error: null }),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    supabase.channel = jest.fn().mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn(),
    });
    supabase.removeChannel = jest.fn();
  });

  it('renders loading state', () => {
    render(<AdminIssues />);
    expect(screen.getByText('Loading issues...')).toBeInTheDocument();
  });

  it('renders error state', async () => {
    supabase.from.mockReturnValue({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: null, error: new Error('Fetch failed') }),
    });
    
    render(<AdminIssues />);
    await waitFor(() => {
      expect(screen.getByText('Failed to fetch issues. Please try again.')).toBeInTheDocument();
    });
  });

  it('renders issues table', async () => {
    render(<AdminIssues />);
    await waitFor(() => {
      expect(screen.getByText('Test Issue')).toBeInTheDocument();
      expect(screen.getByText('user-1')).toBeInTheDocument();
      expect(screen.getByText('pending')).toBeInTheDocument();
    });
  });

  it('handles status change', async () => {
    supabase.from.mockReturnValueOnce({
      select: jest.fn().mockReturnThis(),
      order: jest.fn().mockResolvedValue({ data: mockIssues, error: null }),
    }).mockReturnValueOnce({
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ error: null }),
    });
    
    render(<AdminIssues />);
    await waitFor(() => screen.getByText('Test Issue'));
    
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: 'resolved' } });
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('issues');
      expect(supabase.from().update).toHaveBeenCalledWith({ status: 'resolved' });
    });
  });

  it('shows issue details modal', async () => {
    render(<AdminIssues />);
    await waitFor(() => screen.getByText('Test Issue'));
    
    const viewButton = screen.getByText('Test Issue');
    fireEvent.click(viewButton);
    
    expect(screen.getByText('Issue Details')).toBeInTheDocument();
    expect(screen.getByText('Test Issue')).toBeInTheDocument();
    expect(screen.getByText('user-1')).toBeInTheDocument();
  });
});