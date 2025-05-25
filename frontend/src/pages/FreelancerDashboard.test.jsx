import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import FreelancerDashboard from './FreelancerDashboard';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../utils/supabaseClient', () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: {}, error: null }),
      }),
    }),
  }),
}));
jest.mock('../components/ApplyJobSection', () => () => <div>Mocked ApplyJobSection</div>);
jest.mock('../components/FreelancerProfile', () => () => <div>Mocked FreelancerProfile</div>);
jest.mock('../components/ChatSectionWrapper', () => () => <div>Mocked ChatSectionWrapper</div>);
jest.mock('../components/ActiveProjects', () => () => <div>Mocked ActiveProjects</div>);
jest.mock('../components/DashboardLayout', () => ({ role, menuItems, contentMap }) => (
  <div data-testid="dashboard-layout">
    <div className="dashboard-sidebar" data-testid="sidebar">
      {menuItems.map(item => (
        <button key={item} onClick={() => contentMap[item].props.children}>
          {item}
        </button>
      ))}
    </div>
    <button data-testid="toggle-btn" aria-label="Toggle navigation menu">Toggle</button>
    <div data-testid="content">
      {contentMap[menuItems[0]] || <div>Default Content</div>}
    </div>
  </div>
));

// Mock window.innerWidth
beforeAll(() => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: 1024,
  });
});

describe('FreelancerDashboard', () => {
  const mockNavigate = jest.fn();
  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({
      user: { sub: 'auth0|freelancer123' },
      isLoading: false,
      isAuthenticated: true,
    });
    useNavigate.mockReturnValue(mockNavigate);
  });

  it('renders loading state when auth is loading', () => {
    useAuth0.mockReturnValue({ isLoading: true, isAuthenticated: false });
    render(<FreelancerDashboard />);
    expect(screen.getByText('Loading auth…')).toBeInTheDocument();
  });

  it('renders login prompt when not authenticated', () => {
    useAuth0.mockReturnValue({ isLoading: false, isAuthenticated: false });
    render(<FreelancerDashboard />);
    expect(screen.getByText('Please log in to view your dashboard.')).toBeInTheDocument();
  });

  it('renders default My Profile section', () => {
    render(<FreelancerDashboard />);
    expect(screen.getByTestId('dashboard-layout')).toBeInTheDocument();
    expect(screen.getByText('Mocked FreelancerProfile')).toBeInTheDocument();
  });

  it('toggles sidebar visibility on hamburger click', () => {
    render(<FreelancerDashboard />);
    const sidebar = screen.getByTestId('sidebar');
    const toggleBtn = screen.getByTestId('toggle-btn');

    fireEvent.click(toggleBtn);
    expect(sidebar).toHaveClass('dashboard-sidebar hidden');

    fireEvent.click(toggleBtn);
    expect(sidebar).not.toHaveClass('hidden');
  });

  it('switches to Clients section when clicked', () => {
    render(<FreelancerDashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Clients/i }));
    expect(screen.getByText('Clients')).toBeInTheDocument();
  });

  it('switches to Inbox section when clicked', () => {
    render(<FreelancerDashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(screen.getByText('Mocked ChatSectionWrapper')).toBeInTheDocument();
  });

  it('switches to Projects section when clicked', () => {
    render(<FreelancerDashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Projects/i }));
    expect(screen.getByText('Mocked ActiveProjects')).toBeInTheDocument();
  });

  it('switches to Available Jobs section when clicked', () => {
    render(<FreelancerDashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Available Jobs/i }));
    expect(screen.getByText('Mocked ApplyJobSection')).toBeInTheDocument();
  });

  it('navigates to Report Issue page when clicked', () => {
    render(<FreelancerDashboard />);
    fireEvent.click(screen.getByRole('button', { name: /Report Issue/i }));
    fireEvent.click(screen.getByText('Go to Report Issue Page'));
    expect(mockNavigate).toHaveBeenCalledWith('/report-issue');
  });

  it('closes sidebar on section select when screen is narrow', () => {
    window.innerWidth = 800;
    window.dispatchEvent(new Event('resize'));
    render(<FreelancerDashboard />);
    const sidebar = screen.getByTestId('sidebar');

    fireEvent.click(screen.getByRole('button', { name: /Inbox/i }));
    expect(sidebar).toHaveClass('dashboard-sidebar hidden');
  });
});