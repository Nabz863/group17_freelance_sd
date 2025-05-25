import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ChatSection from './ChatSection';

jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient.js', () => ({
  from: jest.fn(),
  channel: jest.fn(),
  removeChannel: jest.fn(),
}));

describe('ChatSection component', () => {
  const mockProjectId = 'proj-123';
  const mockUserId = 'user-456';
  const mockMessages = [
    { id: 'msg-1', sender_id: mockUserId, text: 'Hello', timestamp: '2025-01-01T12:35:00Z' },
    { id: 'msg-2', sender_id: 'user-789', text: 'Test message', timestamp: '2025-02-01T12:35:00Z' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock scrollIntoView
    Element.prototype.scrollIntoView = jest.fn();

    // Mock Auth0
    useAuth0.mockReturnValue({
      user: { sub: mockUserId },
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock Supabase from
    supabase.from.mockImplementation((table) => {
      if (table === 'messages') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          order: jest.fn().mockReturnValue({
            data: mockMessages,
            error: null,
          }),
          insert: jest.fn().mockReturnThis(),
          then: jest.fn().mockResolvedValue({
            data: null,
            error: null,
          }),
        };
      }
      return {};
    });

    // Mock Supabase channel
    supabase.channel.mockReturnValue({
      on: jest.fn().mockReturnThis(),
      subscribe: jest.fn().mockReturnThis(),
      unsubscribe: jest.fn(),
    });

    // Mock Supabase removeChannel
    supabase.removeChannel.mockReturnValue(undefined);
  });

  afterEach(() => {
    // Clean up scrollIntoView mock
    delete Element.prototype.scrollIntoView;
  });

  it('renders messages correctly', async () => {
    render(<ChatSection projectId={mockProjectId} currentUserId={mockUserId} />);
    await waitFor(() => {
      expect(screen.getByText('Hello')).toBeInTheDocument();
      expect(screen.getByText('test message')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('sends a message correctly', async () => {
    render(<ChatSection projectId={mockProjectId} currentUserId={mockUserId} />);
    
    const input = screen.getByPlaceholderText('Type a message…');
    fireEvent.change(input, { target: { value: 'Test message' } });
    
    const sendButton = screen.getByRole('button', { name: 'Send' });
    fireEvent.click();
    
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('messages');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        project_id: mockProjectId,
        sender_id: mockUserId,
        receiver_id: null,
        text: 'Test message',
      });
      expect(input).toHaveValue('');
    }, { timeout: 2000 });
  });

  it('handles enter key to send message', async () => {
    render(<ChatSection projectId={mockProjectId} currentUserId={mockUserId} />);
    
    const input = screen.getByPlaceholderText('Type a message…');
    fireEvent.change(input, { target: { value: 'Test message' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    await waitFor(() => {
      expect(supabase.from().insert).toHaveBeenCalledWith({
        project_id: mockProjectId,
        sender_id: mockUserId,
        receiver_id: null,
        text: 'Test message',
      });
    }, { timeout: 2000 });
  });

  it('does not send empty messages', async () => {
    render(<ChatSection projectId={mockProjectId} currentUserId={mockUserId} />);
    
    const input = screen.getByPlaceholderText('Type a message…');
    fireEvent.change(input, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Send' }));
    
    expect(supabase.from().insert).not.toHaveBeenCalled();
  });
});