import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import ChatSectionWrapper from './ChatSectionWrapper';
import ChatList from './ChatList';
import ChatSection from './ChatSection';
import supabase from '../utils/supabaseClient';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('./ChatList');
jest.mock('./ChatSection');
jest.mock('../utils/supabaseClient');

describe('ChatSectionWrapper', () => {
  const mockUser = { sub: 'user-123' };
  const mockIsClient = true;

  beforeEach(() => {
    jest.clearAllMocks();

    useAuth0.mockReturnValue({
      user: mockUser,
      isAuthenticated: true,
      isLoading: false,
    });

    // Mock Supabase
    supabase.from.mockImplementation((table) => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockResolvedValue({ data: null, error: null }),
    }));

    // Mock ChatList to render a button that triggers onSelect
    ChatList.mockImplementation(({ userId, isClient, onSelect }) => (
      <div data-testid="chat-list">
        <button
          onClick={() => onSelect('project-123', 'Test Project')}
          data-testid="select-project"
        >
          Select Test Project
        </button>
      </div>
    ));

    // Mock ChatSection to render a simple div
    ChatSection.mockImplementation(({ projectId, currentUserId, isClient }) => (
      <div data-testid="chat-section">
        Chat for {projectId} by {currentUserId}
      </div>
    ));

    // Debug mock setup
    console.log('Supabase mock setup:', supabase.from.mockImplementation);
    console.log('ChatList mock setup:', ChatList.mockImplementation);
    console.log('ChatSection mock setup:', ChatSection.mockImplementation);
  });

  it('renders nothing when user is not provided', () => {
    useAuth0.mockReturnValue({ user: null, isAuthenticated: false, isLoading: false });
    const { container } = render(<ChatSectionWrapper isClient={mockIsClient} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('renders ChatList when showList is true', () => {
    render(<ChatSectionWrapper user={mockUser} isClient={mockIsClient} />);
    expect(screen.getByTestId('chat-list')).toBeInTheDocument();
    expect(screen.getByText('Select Test Project')).toBeInTheDocument();
    expect(ChatList).toHaveBeenCalledWith(
      expect.objectContaining({
        userId: mockUser.sub,
        isClient: mockIsClient,
        onSelect: expect.any(Function),
      }),
      expect.any(Object)
    );
  });

  it('renders select chat message when no project is selected and showList is false', () => {
    render(<ChatSectionWrapper user={mockUser} isClient={mockIsClient} />);
    const selectButton = screen.getByTestId('select-project');
    fireEvent.click(selectButton);
    const backButton = screen.getByText('Back to Chats');
    fireEvent.click(backButton);

    expect(screen.getByText('Select a chat to begin messaging.')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-list')).not.toBeInTheDocument();
    expect(screen.queryByTestId('chat-section')).not.toBeInTheDocument();
  });

  it('renders ChatSection when a project is selected', async () => {
    render(<ChatSectionWrapper user={mockUser} isClient={mockIsClient} />);
    const selectButton = screen.getByTestId('select-project');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByTestId('chat-section')).toBeInTheDocument();
      expect(screen.getByText('Test Project')).toBeInTheDocument();
      expect(screen.getByText('Back to Chats')).toBeInTheDocument();
      expect(ChatSection).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'project-123',
          currentUserId: mockUser.sub,
          isClient: mockIsClient,
        }),
        expect.any(Object)
      );
      expect(screen.queryByTestId('chat-list')).not.toBeInTheDocument();
    });
  });

  it('handles project selection via onSelect', () => {
    render(<ChatSectionWrapper user={mockUser} isClient={mockIsClient} />);
    const selectButton = screen.getByTestId('select-project');
    fireEvent.click(selectButton);

    expect(screen.getByText('Test Project')).toBeInTheDocument();
    expect(screen.getByTestId('chat-section')).toBeInTheDocument();
    expect(screen.queryByTestId('chat-list')).not.toBeInTheDocument();
  });

  it('toggles back to chat list when Back to Chats is clicked', async () => {
    render(<ChatSectionWrapper user={mockUser} isClient={mockIsClient} />);
    const selectButton = screen.getByTestId('select-project');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByTestId('chat-section')).toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Chats');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('chat-list')).toBeInTheDocument();
      expect(screen.queryByTestId('chat-section')).not.toBeInTheDocument();
      expect(screen.queryByText('Test Project')).not.toBeInTheDocument();
    });
  });

  it('shows chat list when selectedProject is null via useEffect', async () => {
    render(<ChatSectionWrapper user={mockUser} isClient={mockIsClient} />);
    const selectButton = screen.getByTestId('select-project');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.queryByTestId('chat-list')).not.toBeInTheDocument();
    });

    const backButton = screen.getByText('Back to Chats');
    fireEvent.click(backButton);

    await waitFor(() => {
      expect(screen.getByTestId('chat-list')).toBeInTheDocument();
    });
  });
});