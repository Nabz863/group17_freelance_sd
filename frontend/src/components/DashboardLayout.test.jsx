import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from './DashboardLayout';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../utils/supabaseClient', () => ({
  from: jest.fn().mockReturnValue({
    insert: jest.fn().mockReturnThis(),
    then: jest.fn().mockResolvedValue({ data: null, error: null }),
  }),
}));

// Sample props
const menuItems = ['Home', 'Settings'];
const contentMap = {
  Home: <p>Welcome to Home</p>,
  Settings: <p>Change your preferences</p>,
};

describe('DashboardLayout', () => {
  const mockLogout = jest.fn();
  const mockNavigate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    useAuth0.mockReturnValue({
      logout: mockLogout,
      user: { sub: 'user-1' },
      isAuthenticated: true,
      isLoading: false,
    });

    useNavigate.mockReturnValue(mockNavigate);

    // Debug mock setup
    console.log('Supabase mock setup:', require('../utils/supabaseClient').from);
  });

  it('renders default role and shows initial content', () => {
    render(<DashboardLayout menuItems={menuItems} contentMap={contentMap} />);

    expect(screen.getByText('User')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Home')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('changes content when sidebar button is clicked', () => {
    render(<DashboardLayout menuItems={menuItems} contentMap={contentMap} />);

    fireEvent.click(screen.getByText('Settings'));
    expect(screen.getByText('Change your preferences')).toBeInTheDocument();
  });

  it('toggles sidebar visibility when hamburger is clicked (checks class change)', () => {
    render(<DashboardLayout menuItems={menuItems} contentMap={contentMap} />);

    const sidebar = screen.getByLabelText('Sidebar');
    const toggleBtn = screen.getByLabelText('Toggle navigation menu');

    expect(sidebar.className).not.toContain('hidden');

    fireEvent.click(toggleBtn);
    expect(sidebar.className).toContain('hidden');

    fireEvent.click(toggleBtn);
    expect(sidebar.className).not.toContain('hidden');
  });

  it('shows fallback content when no matching section found', () => {
    render(<DashboardLayout menuItems={['Ghost']} contentMap={{}} />);
    expect(screen.getByText('No content found.')).toBeInTheDocument();
  });

  it('renders nothing if menuItems is empty', () => {
    render(<DashboardLayout menuItems={[]} contentMap={{}} />);
    
    // Hamburger still renders even with no menu, so check specific absence
    expect(screen.queryByText('Home')).not.toBeInTheDocument();
    expect(screen.queryByText('Settings')).not.toBeInTheDocument();
    expect(screen.getByText('No content found.')).toBeInTheDocument();
  });
});