import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import supabase from '../utils/supabaseClient';
import UserSearch from './UserSearch';

// Mock dependencies
jest.mock('../utils/supabaseClient');

describe('UserSearch', () => {
  const mockOnSelectUser = jest.fn();
  const mockClients = [
    {
      user_id: 'client-123',
      email: 'client@example.com',
      profile: { firstName: 'Client', lastName: 'One' },
    },
  ];
  const mockFreelancers = [
    {
      user_id: 'freelancer-456',
      email: 'freelancer@example.com',
      profile: { firstName: 'Freelancer', lastName: 'Two' },
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Mock Supabase with delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    supabase.from.mockImplementation((table) => {
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          like: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          limit: jest.fn().mockImplementation(async () => {
            await delay(400); // Delay to simulate async
            return { data: mockClients, error: null };
          }),
        };
      }
      if (table === 'freelancers') {
        return {
          select: jest.fn().mockReturnThis(),
          like: jest.fn().mockReturnThis(),
          or: jest.fn().mockReturnThis(),
          limit: jest.fn().mockImplementation(async () => {
            await delay(400);
            return { data: mockFreelancers, error: null };
          }),
        };
      }
      return null;
    });

    // Debug mock setup
    console.log('Supabase mock setup:', supabase.from.mockImplementation);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders search input', () => {
    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    expect(screen.getByPlaceholderText('Search by email or name...')).toBeInTheDocument();
  });

  it('updates search query on input change', () => {
    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    fireEvent.change(input, { target: { value: 'test' } });
    expect(input).toHaveValue('test');
  });

  it('displays loading state when searching', async () => {
    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    fireEvent.change(input, { target: { value: 'test' } });

    // Advance debounce timer (300ms)
    jest.advanceTimersByTime(300);

    await waitFor(() => {
      expect(screen.getByText('Searching...')).toBeInTheDocument();
    });

    // Advance time to resolve Supabase mock
    jest.advanceTimersByTime(400);
  });

  it('displays search results', async () => {
    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    console.log('Input element found:', input); // Debug log
    fireEvent.change(input, { target: { value: 'test' } });

    // Advance timers for debounce (300ms) and Supabase (400ms)
    jest.advanceTimersByTime(700);
    console.log('Timers advanced by 700ms'); // Debug log

    await waitFor(() => {
      expect(screen.getByText('Client One')).toBeInTheDocument();
      expect(screen.getByText('client@example.com')).toBeInTheDocument();
      expect(screen.getByText('Client')).toBeInTheDocument();
      expect(screen.getByText('Freelancer Two')).toBeInTheDocument();
      expect(screen.getByText('freelancer@example.com')).toBeInTheDocument();
      expect(screen.getByText('Freelancer')).toBeInTheDocument();
    });
  });

  it('displays no results message for empty results', async () => {
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return { data: [], error: null };
      }),
    }));

    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    fireEvent.change(input, { target: { value: 'test' } });

    jest.advanceTimersByTime(700);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });

  it('clears results when query is empty', async () => {
    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    fireEvent.change(input, { target: { value: 'test' } });

    jest.advanceTimersByTime(700);

    await waitFor(() => {
      expect(screen.getByText('Client One')).toBeInTheDocument();
    });

    fireEvent.change(input, { target: { value: '' } });
    expect(screen.queryByText('Client One')).not.toBeInTheDocument();
  });

  it('calls onSelectUser and clears query on user selection', async () => {
    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    fireEvent.change(input, { target: { value: 'test' } });

    jest.advanceTimersByTime(700);

    await waitFor(() => {
      expect(screen.getByText('Client One')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Client One'));

    expect(mockOnSelectUser).toHaveBeenCalledWith({
      id: 'client-123',
      email: 'client@example.com',
      name: 'Client One',
      role: 'Client',
    });
    expect(input).toHaveValue('');
  });

  it('handles Supabase error gracefully', async () => {
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      like: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 400));
        return { data: null, error: new Error('Search failed') };
      }),
    }));

    render(<UserSearch onSelectUser={mockOnSelectUser} />);
    const input = screen.getByPlaceholderText('Search by email or name...');
    fireEvent.change(input, { target: { value: 'test' } });

    jest.advanceTimersByTime(700);

    await waitFor(() => {
      expect(screen.getByText('No users found')).toBeInTheDocument();
    });
  });
});