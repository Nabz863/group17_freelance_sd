import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import { toast } from 'react-toastify';
import ClientDashboard from './ClientDashboard';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');
jest.mock('react-toastify', () => ({
  toast: { success: jest.fn(), error: jest.fn() },
}));
jest.mock('../components/ClientProfile', () => () => <div>Mocked ClientProfile</div>);
jest.mock('../components/ChatSectionWrapper', () => () => <div>Mocked ChatSectionWrapper</div>);
jest.mock('../components/ActiveProjects', () => () => <div>Mocked ActiveProjects</div>);
jest.mock('./PostJobForm', () => () => <div>Mocked PostJobForm</div>);
jest.mock('../components/ViewApplicationsSection', () => ({ projectId, onAssign }) => (
  <div>Mocked ViewApplicationsSection <button onClick={() => onAssign('freelancer123')}>Assign</button></div>
));
jest.mock('../services/contractAPI', () => ({
  createContract: jest.fn(),
}));
jest.mock('../components/DashboardLayout', () => ({ role, menuItems, contentMap }) => (
  <div data-testid="dashboard-layout">
    <h1>Mock Dashboard - Role: {role}</h1>
    <div data-testid="menu-items">{menuItems.join(', ')}</div>
    <div data-testid="content">
      {contentMap[menuItems[0]]}
      {menuItems.map(item => (
        <button key={item} onClick={() => contentMap[item].props.children}>
          {item}
        </button>
      ))}
    </div>
  </div>
));

describe('ClientDashboard', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      user: { sub: 'auth0|client123' },
      isLoading: false,
      isAuthenticated: true,
    });
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [{ id: 'project123' }], error: null }),
    }));
  });

  it('renders loading state when auth is loading', () => {
    useAuth0.mockReturnValue({ isLoading: true, isAuthenticated: false });
    render(<ClientDashboard />);
    expect(screen.getByText('Loading auth…')).toBeInTheDocument();
  });

  it('renders login prompt when not authenticated', () => {
    useAuth0.mockReturnValue({ isLoading: false, isAuthenticated: false });
    render(<ClientDashboard />);
    expect(screen.getByText('Please log in to view your dashboard.')).toBeInTheDocument();
  });

  it('renders default My Profile section', () => {
    render(<ClientDashboard />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Mock Dashboard - Role: Client')).toBeInTheDocument();
    expect(screen.getByText('Mocked ClientProfile')).toBeInTheDocument();
  });

  it('renders correct menu items', () => {
    render(<ClientDashboard />);
    expect(screen.getByTestId('menu-items')).toHaveTextContent(
      'My Profile, Freelancers, Inbox, Payments, Projects, Post a Job, Applications'
    );
  });

  it('switches to Freelancers section', () => {
    render(<ClientDashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Freelancers/i }));
    expect(screen.getByText('Freelancers')).toBeInTheDocument();
  });

  it('switches to Applications section with projectId', async () => {
    render(<ClientDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Applications/i }));
      expect(screen.getByText('Mocked ViewApplicationsSection')).toBeInTheDocument();
    });
  });

  it('shows loading applications when no projectId', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      then: jest.fn().mockResolvedValue({ data: [], error: null }),
    }));
    render(<ClientDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Applications/i }));
      expect(screen.getByText('Loading applications…')).toBeInTheDocument();
    });
  });

  it('handles assign action successfully', async () => {
    const { createContract } = require('../services/contractAPI');
    createContract.mockResolvedValue({});
    render(<ClientDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Applications/i }));
      fireEvent.click(screen.getByText('Assign'));
    });
    expect(createContract).toHaveBeenCalledWith({
      projectId: 'project123',
      title: 'Contract for project project123',
      freelancerId: 'freelancer123',
    });
    expect(toast.success).toHaveBeenCalledWith('Contract created – freelancer notified');
  });

  it('handles assign action error', async () => {
    const { createContract } = require('../services/contractAPI');
    createContract.mockRejectedValue(new Error('Failed'));
    render(<ClientDashboard />);
    await waitFor(() => {
      fireEvent.click(screen.getByRole('button', { name: /Applications/i }));
      fireEvent.click(screen.getByText('Assign'));
    });
    expect(toast.error).toHaveBeenCalledWith('Failed to create contract');
  });
});