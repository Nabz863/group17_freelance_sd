import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ChatList from './ChatList';

jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('ChatList component', () => {
  const mockUserId = 'user-123';
  const mockProjects = [
    { id: 'proj-123', description: JSON.stringify({ title: 'Project 1' }), freelancer_id: mockUserId, client_id: 'client-456' },
    { id: 'proj-124', description: JSON.stringify({ title: 'Project 2' }), freelancer_id: mockUserId, client_id: 'client-456' },
  ];
  const mockOnSelect = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      user: { sub: mockUserId },
      isAuthenticated: true,
      isLoading: false,
    });
    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockImplementation((column, value) => {
            if ((column === 'freelancer_id' || column === 'client_id') && value === mockUserId) {
              return {
                data: mockProjects,
                error: null,
              };
            }
            return { data: [], error: null };
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [],
        error: null,
      };
    });
  });

  it('renders no chats message when no projects', async () => {
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnValue({ data: [], error: null }),
    }));
    
    render(<ChatList userId={mockUserId} isClient={false} onSelect={mockOnSelect} />);
    await waitFor(() => {
      expect(screen.getByText('No chats yet')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders project list for freelancer', async () => {
    render(<ChatList userId={mockUserId} isClient={false} onSelect={mockOnSelect} />);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('renders project list for client', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockImplementation((column, value) => {
            if (column === 'client_id' && value === mockUserId) {
              return {
                data: mockProjects.map(p => ({ ...p, client_id: mockUserId, freelancer_id: 'freelancer-789' })),
                error: null,
              };
            }
            return { data: [], error: null };
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [],
        error: null,
      };
    });

    render(<ChatList userId={mockUserId} isClient={true} onSelect={mockOnSelect} />);
    await waitFor(() => {
      expect(screen.getByText('Project 1')).toBeInTheDocument();
      expect(screen.getByText('Project 2')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('calls onSelect when project is clicked', async () => {
    render(<ChatList userId={mockUserId} isClient={false} onSelect={mockOnSelect} />);
    await waitFor(() => screen.getByText('Project 1'), { timeout: 2000 });
    
    const projectButton = screen.getByRole('button', { name: 'Project 1' });
    fireEvent.click(projectButton);
    
    expect(mockOnSelect).toHaveBeenCalledWith('proj-123');
  });

  it('handles invalid JSON in description', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockImplementation((column, value) => {
            if (column === 'freelancer_id' && value === mockUserId) {
              return {
                data: [{ id: 'proj-125', description: 'invalid-json', freelancer_id: mockUserId }],
                error: null,
              };
            }
            return { data: [], error: null };
          }),
        };
      }
      return {
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        data: [],
        error: null,
      };
    });
    
    render(<ChatList userId={mockUserId} isClient={false} onSelect={mockOnSelect} />);
    await waitFor(() => {
      expect(screen.getByText('proj-125')).toBeInTheDocument();
    }, { timeout: 2000 });
  });
});