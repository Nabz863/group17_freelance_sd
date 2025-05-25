import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ClientContracts from './ClientContracts';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('ClientContracts', () => {
  const mockUser = { sub: 'auth0|client123' };
  const mockContracts = [
    { id: '1', title: 'Project A', status: 'active' },
    { id: '2', title: 'Project B', status: 'pending' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      user: mockUser,
      isLoading: false,
      isAuthenticated: true,
    });

    // Mock Supabase
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: mockContracts, error: null }),
    }));
  });

  it('renders loading state when auth is loading', () => {
    useAuth0.mockReturnValue({ isLoading: true, isAuthenticated: false });
    render(<ClientContracts />);
    expect(screen.getByText('Loading your contracts…')).toBeInTheDocument();
  });

  it('renders loading state when fetching contracts', () => {
    render(<ClientContracts />);
    expect(screen.getByText('Loading your contracts…')).toBeInTheDocument();
  });

  it('renders no contracts message when none exist', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    }));

    render(<ClientContracts />);
    await waitFor(() => {
      expect(screen.getByText('No contracts found.')).toBeInTheDocument();
    });
  });

  it('renders list of contracts', async () => {
    render(<ClientContracts />);
    await waitFor(() => {
      expect(screen.getByText('Your Contracts')).toBeInTheDocument();
      expect(screen.getByText('Project A')).toBeInTheDocument();
      expect(screen.getByText('Status: active')).toBeInTheDocument();
      expect(screen.getByText('Project B')).toBeInTheDocument();
      expect(screen.getByText('Status: pending')).toBeInTheDocument();
    });
  });

  it('handles Supabase fetch error gracefully', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: new Error('Fetch failed') }),
    }));

    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<ClientContracts />);
    await waitFor(() => {
      expect(screen.getByText('No contracts found.')).toBeInTheDocument();
      expect(consoleError).toHaveBeenCalledWith('Error fetching contracts:', expect.any(Error));
    });
    consoleError.mockRestore();
  });

  it('does not fetch contracts if user is not authenticated', () => {
    useAuth0.mockReturnValue({ user: null, isLoading: false, isAuthenticated: false });
    render(<ClientContracts />);
    expect(supabase.from).not.toHaveBeenCalled();
    expect(screen.getByText('Loading your contracts…')).toBeInTheDocument();
  });
});