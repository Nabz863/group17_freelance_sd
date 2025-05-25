import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import supabase from '../utils/supabaseClient';
import ClientProfile from './ClientProfile';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('../utils/supabaseClient');

describe('ClientProfile', () => {
  const mockUser = { sub: 'auth0|123' };
  const mockProfile = {
    user_id: 'auth0|123',
    profile: JSON.stringify({
      firstName: 'John',
      lastName: 'Doe',
      companyName: 'Acme Corp',
      clientType: 'business',
      industry: 'Tech',
      projectNeeds: 'Web development',
      location: 'Cape Town',
      budgetRange: 'R10,000 - R25,000',
      projectTimeline: '1-3 months',
      contactPhone: '+27 12 345 6789',
      contactEmail: 'john@acme.com',
      preferredContact: 'email',
    }),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    useAuth0.mockReturnValue({ user: mockUser });

    // Mock Supabase delay
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    supabase.from.mockImplementation((table) => {
      if (table === 'clients') {
        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockImplementation(async () => {
            await delay(100);
            return { data: mockProfile, error: null };
          }),
          update: jest.fn().mockReturnThis(),
        };
      }
      return null;
    });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders loading state initially', () => {
    render(<ClientProfile />);
    expect(screen.getByText('Loading profile...')).toBeInTheDocument();
  });

  it('displays no profile message when no profile exists', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: null }),
    }));

    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText(/No profile found/)).toBeInTheDocument();
    });
  });

  it('renders profile details when data is fetched', async () => {
    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText('Client Profile')).toBeInTheDocument();
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Acme Corp')).toBeInTheDocument();
      expect(screen.getByText('business')).toBeInTheDocument();
      expect(screen.getByText('Tech')).toBeInTheDocument();
      expect(screen.getByText('Web development')).toBeInTheDocument();
      expect(screen.getByText('Cape Town')).toBeInTheDocument();
      expect(screen.getByText('R10,000 - R25,000')).toBeInTheDocument();
      expect(screen.getByText('1-3 months')).toBeInTheDocument();
      expect(screen.getByText('+27 12 345 6789')).toBeInTheDocument();
      expect(screen.getByText('john@acme.com')).toBeInTheDocument();
      expect(screen.getByText('email')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });

  it('toggles to edit mode when Edit Profile is clicked', async () => {
    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Edit Profile'));

    expect(screen.getByText('Save Changes')).toBeInTheDocument();
    expect(screen.getByText('Cancel')).toBeInTheDocument();
    expect(screen.getByLabelText('First Name *')).toHaveValue('John');
    expect(screen.getByLabelText('Last Name *')).toHaveValue('Doe');
    expect(screen.getByLabelText('Company Name *')).toHaveValue('Acme Corp');
    expect(screen.getByLabelText('Client Type *')).toHaveValue('business');
    expect(screen.getByLabelText('Industry *')).toHaveValue('Tech');
    expect(screen.getByLabelText('Project Needs *')).toHaveValue('Web development');
    expect(screen.getByLabelText('Location *')).toHaveValue('Cape Town');
    expect(screen.getByLabelText('Budget Range *')).toHaveValue('R10,000 - R25,000');
    expect(screen.getByLabelText('Project Timeline *')).toHaveValue('1-3 months');
    expect(screen.getByLabelText('Contact Phone *')).toHaveValue('+27 12 345 6789');
    expect(screen.getByLabelText('Contact Email *')).toHaveValue('john@acme.com');
    expect(screen.getByLabelText(/Preferred Contact Method/).closest('section')).toHaveTextContent('Email');
  });

  it('updates form fields on input change', async () => {
    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Profile'));
    });

    const firstNameInput = screen.getByLabelText('First Name *');
    fireEvent.change(firstNameInput, { target: { value: 'Jane' } });
    expect(firstNameInput).toHaveValue('Jane');

    const projectNeedsInput = screen.getByLabelText('Project Needs *');
    fireEvent.change(projectNeedsInput, { target: { value: 'Mobile app development' } });
    expect(projectNeedsInput).toHaveValue('Mobile app development');

    const clientTypeSelect = screen.getByLabelText('Client Type *');
    fireEvent.change(clientTypeSelect, { target: { value: 'startup' } });
    expect(clientTypeSelect).toHaveValue('startup');

    const radioEmail = screen.getByLabelText('Email');
    fireEvent.click(radioEmail);
    expect(radioEmail).toBeChecked();
  });

  it('submits form and updates profile', async () => {
    const updatedFormData = {
      firstName: 'Jane',
      lastName: 'Doe',
      companyName: 'Acme Corp',
      clientType: 'startup',
      industry: 'Tech',
      projectNeeds: 'Mobile app development',
      location: 'Cape Town',
      budgetRange: 'R25,000 - R50,000',
      projectTimeline: '3-6 months',
      contactPhone: '+27 98 765 4321',
      contactEmail: 'jane@acme.com',
      preferredContact: 'phone',
    };

    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      update: jest.fn().mockReturnThis(),
      update: jest.fn().mockImplementation(async () => {
        await new Promise(resolve => setTimeout(resolve, 100));
        return { data: null, error: null };
      }),
    }));

    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Profile'));
    });

    // Update form fields
    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText('Client Type *'), { target: { value: 'startup' } });
    fireEvent.change(screen.getByLabelText('Project Needs *'), { target: { value: 'Mobile app development' } });
    fireEvent.change(screen.getByLabelText('Budget Range *'), { target: { value: 'R25,000 - R50,000' } });
    fireEvent.change(screen.getByLabelText('Project Timeline *'), { target: { value: '3-6 months' } });
    fireEvent.change(screen.getByLabelText('Contact Phone *'), { target: { value: '+27 98 765 4321' } });
    fireEvent.change(screen.getByLabelText('Contact Email *'), { target: { value: 'jane@acme.com' } });
    fireEvent.click(screen.getByLabelText('Phone'));

    // Submit form
    fireEvent.click(screen.getByText('Save Changes'));
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(supabase.from().update).toHaveBeenCalledWith({
        profile: JSON.stringify(updatedFormData),
        updated_at: expect.any(String),
      });
      expect(screen.getByText('Edit Profile')).toBeInTheDocument(); // Edit mode exited
    });
  });

  it('cancels editing and reverts to view mode', async () => {
    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Profile'));
    });

    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Jane' } });
    fireEvent.click(screen.getByText('Cancel'));

    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
  });

  it('handles Supabase fetch error gracefully', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockRejectedValue(new Error('Fetch failed')),
    }));

    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText(/No profile found/)).toBeInTheDocument();
    });
  });

  it('handles Supabase update error gracefully', async () => {
    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockProfile, error: null }),
      update: jest.fn().mockReturnThis(),
      update: jest.fn().mockRejectedValue(new Error('Update failed')),
    }));

    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      fireEvent.click(screen.getByText('Edit Profile'));
    });

    fireEvent.change(screen.getByLabelText('First Name *'), { target: { value: 'Jane' } });
    fireEvent.click(screen.getByText('Save Changes'));
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText('Save Changes')).toBeInTheDocument(); // Still in edit mode
    });
  });

  it('handles malformed profile data', async () => {
    const malformedProfile = {
      user_id: 'auth0|123',
      profile: 'invalid-json',
    };

    supabase.from.mockImplementation(() => ({
      select: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: malformedProfile, error: null }),
    }));

    render(<ClientProfile />);
    jest.advanceTimersByTime(100);

    await waitFor(() => {
      expect(screen.getByText('Client Profile')).toBeInTheDocument();
      expect(screen.getByText('Edit Profile')).toBeInTheDocument();
    });
  });
});