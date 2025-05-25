import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import ReportIssue from './ReportIssue';
import UserSearch from './UserSearch';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../utils/supabaseClient');
jest.mock('./UserSearch');

describe('ReportIssue', () => {
  const mockUser = { id: 'user-123' };
  const mockNavigate = jest.fn();
  const mockOnClose = jest.fn();
  const mockSelectedUser = {
    id: 'reported-456',
    email: 'reported@example.com',
    name: 'Reported User',
    role: 'Client',
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

    // Mock navigate
    useNavigate.mockReturnValue(mockNavigate);

    // Mock Supabase
    supabase.auth = {
      getUser: jest.fn().mockResolvedValue({ user: mockUser }),
    };
    supabase.from.mockImplementation((table) => {
      if (table === 'issues') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      }
      return {};
    });

    // Mock UserSearch
    UserSearch.mockImplementation(({ onSelectUser }) => (
      <button
        data-testid="select-user"
        onClick={() => onSelectUser(mockSelectedUser)}
      >
        Select User
      </button>
    ));

    // Mock Date for consistent timestamp
    mockDate = new Date('2025-05-25T12:00:00Z');
    jest.spyOn(global, 'Date').mockImplementation(() => mockDate);

    // Debug mock setup
    console.log('Supabase auth mock setup:', supabase.auth.getUser);
    console.log('Supabase from mock setup:', supabase.from.mockImplementation);
  });

  afterEach(() => {
    jest.spyOn(global, 'Date').mockRestore();
  });

  it('renders form with correct elements', () => {
    render(<ReportIssue onClose={mockOnClose} />);

    expect(screen.getByText('Report Issue')).toBeInTheDocument();
    expect(screen.getByTestId('select-user')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter a brief title for the issue')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/describe the issue in detail/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Report Issue' })).toBeInTheDocument();
  });

  it('updates title and description on input change', () => {
    render(<ReportIssue onClose={mockOnClose} />);

    const titleInput = screen.getByPlaceholderText('Enter a brief title for the issue');
    const descriptionInput = screen.getByPlaceholderText(/describe the issue in detail/i);

    fireEvent.change(titleInput, { target: { value: 'Test Title' } });
    fireEvent.change(descriptionInput, { target: { value: 'Test Description' } });

    expect(titleInput).toHaveValue('Test Title');
    expect(descriptionInput).toHaveValue('Test Description');
  });

  it('handles user selection from UserSearch', async () => {
    render(<ReportIssue onClose={mockOnClose} />);

    const selectButton = screen.getByTestId('select-user');
    fireEvent.click(selectButton);

    await waitFor(() => {
      expect(screen.getByText('Selected User:')).toBeInTheDocument();
      expect(screen.getByText(mockSelectedUser.name)).toBeInTheDocument();
      expect(screen.getByText(mockSelectedUser.email)).toBeInTheDocument();
      expect(screen.getByText(mockSelectedUser.role)).toBeInTheDocument();
      expect(screen.getByText('Clear Selection')).toBeInTheDocument();
    });
  });

  it('clears selected user when Clear Selection is clicked', async () => {
    render(<ReportIssue onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('select-user'));
    await waitFor(() => {
      expect(screen.getByText(mockSelectedUser.name)).toBeInTheDocument();
    });

    const clearButton = screen.getByText('Clear Selection');
    fireEvent.click(clearButton);

    await waitFor(() => {
      expect(screen.queryByText(mockSelectedUser.name)).not.toBeInTheDocument();
      expect(screen.queryByText('Clear Selection')).not.toBeInTheDocument();
    });
  });

  it('submits form successfully and redirects', async () => {
    render(<ReportIssue onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('select-user'));
    fireEvent.change(screen.getByPlaceholderText('Enter a brief title for the issue'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByPlaceholderText(/describe the issue in detail/i), {
      target: { value: 'Test Description' },
    });

    const submitButton = screen.getByRole('button', { name: 'Report Issue' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('issues');
      expect(supabase.from().insert).toHaveBeenCalledWith({
        reporter_id: mockUser.id,
        reported_id: mockSelectedUser.id,
        title: 'Test Title',
        description: 'Test Description',
        reported_email: mockSelectedUser.email,
        reported_name: mockSelectedUser.name,
        status: 'pending',
        created_at: mockDate.toISOString(),
      });
      expect(screen.getByText('Issue reported successfully! Admin has been notified.')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(mockOnClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    }, { timeout: 3000 });
  });

  it('displays error when fields are missing', async () => {
    render(<ReportIssue onClose={mockOnClose} />);

    const submitButton = screen.getByRole('button', { name: 'Report Issue' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Please select a user and fill in all fields')).toBeInTheDocument();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  it('displays error when user is not authenticated', async () => {
    supabase.auth.getUser.mockResolvedValue({ user: null });

    render(<ReportIssue onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('select-user'));
    fireEvent.change(screen.getByPlaceholderText('Enter a brief title for the issue'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByPlaceholderText(/describe the issue in detail/i), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Report Issue' }));

    await waitFor(() => {
      expect(screen.getByText('User not authenticated')).toBeInTheDocument();
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  it('displays error on Supabase insert failure', async () => {
    supabase.from.mockImplementation((table) => {
      if (table === 'issues') {
        return {
          insert: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
        };
      }
      return {};
    });

    render(<ReportIssue onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('select-user'));
    fireEvent.change(screen.getByPlaceholderText('Enter a brief title for the issue'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByPlaceholderText(/describe the issue in detail/i), {
      target: { value: 'Test Description' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Report Issue' }));

    await waitFor(() => {
      expect(screen.getByText('Insert failed')).toBeInTheDocument();
    });
  });

  it('disables submit button when submitting', async () => {
    render(<ReportIssue onClose={mockOnClose} />);

    fireEvent.click(screen.getByTestId('select-user'));
    fireEvent.change(screen.getByPlaceholderText('Enter a brief title for the issue'), {
      target: { value: 'Test Title' },
    });
    fireEvent.change(screen.getByPlaceholderText(/describe the issue in detail/i), {
      target: { value: 'Test Description' },
    });

    const submitButton = screen.getByRole('button', { name: 'Report Issue' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(submitButton).toBeDisabled();
      expect(screen.getByText('Submitting...')).toBeInTheDocument();
    });
  });

  it('calls onClose when Cancel is clicked', () => {
    render(<ReportIssue onClose={mockOnClose} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    fireEvent.click(cancelButton);

    expect(mockOnClose).toHaveBeenCalled();
  });
});