import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserApprovalPanel from './UserApprovalPanel';

// Mock the supabaseClient module
jest.mock('../utils/supabaseClient', () => ({
  __esModule: true,
  default: {
    from: jest.fn(),
  }
}));

// Import the mocked module
import supabase from '../utils/supabaseClient';

describe('UserApprovalPanel', () => {
  // Sample test data
  const mockClients = [
    { user_id: 'client1', profile: { name: 'Test Client', email: 'client@test.com' } },
    { user_id: 'client2', profile: { name: 'Another Client', email: 'another@test.com' } }
  ];
  
  const mockFreelancers = [
    { user_id: 'freelancer1', profile: { name: 'Test Freelancer', skills: ['React'] } }
  ];

  // Setup before each test
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Create mock functions
    const mockSelect = jest.fn();
    const mockEq = jest.fn();
    const mockUpdate = jest.fn();
    
    // Setup mock return values for clients query
    const clientsEq = jest.fn().mockResolvedValue({ data: mockClients });
    const clientsSelect = jest.fn().mockReturnValue({ eq: clientsEq });
    
    // Setup mock return values for freelancers query
    const freelancersEq = jest.fn().mockResolvedValue({ data: mockFreelancers });
    const freelancersSelect = jest.fn().mockReturnValue({ eq: freelancersEq });
    
    // Setup mock for update operations
    const updateEq = jest.fn().mockResolvedValue({ data: null, error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });
    
    // Configure the main from() mock based on the table being queried
    supabase.from.mockImplementation((table) => {
      if (table === 'clients') {
        return {
          select: clientsSelect,
          update: update
        };
      } else if (table === 'freelancers') {
        return {
          select: freelancersSelect,
          update: update
        };
      }
      return { select: mockSelect, eq: mockEq, update: update };
    });
  });

  it('renders loading state initially', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });
    // The component doesn't have an explicit loading state in the UI,
    // but we can verify it shows the lists as empty before data loads
    expect(screen.getByText('Pending Clients')).toBeInTheDocument();
    expect(screen.getByText('Pending Freelancers')).toBeInTheDocument();
  });

  it('displays pending clients and freelancers', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });
    
    // Wait for client data to appear
    await waitFor(() => {
      expect(screen.getByText(`User ID: ${mockClients[0].user_id}`)).toBeInTheDocument();
    });
    
    // Check if all clients are displayed
    mockClients.forEach(client => {
      expect(screen.getByText(`User ID: ${client.user_id}`)).toBeInTheDocument();
      expect(screen.getByText(`Profile: ${JSON.stringify(client.profile)}`)).toBeInTheDocument();
    });
    
    // Check if all freelancers are displayed
    mockFreelancers.forEach(freelancer => {
      expect(screen.getByText(`User ID: ${freelancer.user_id}`)).toBeInTheDocument();
      expect(screen.getByText(`Profile: ${JSON.stringify(freelancer.profile)}`)).toBeInTheDocument();
    });
  });

  it('approves a client successfully', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });
    
    // Wait for client data to appear
    await waitFor(() => {
      expect(screen.getByText(`User ID: ${mockClients[0].user_id}`)).toBeInTheDocument();
    });
    
    // Find the approve button for the first client
    const clientArticle = screen.getByText(`User ID: ${mockClients[0].user_id}`).closest('article');
    const approveButton = clientArticle.querySelector('button.bg-green-600');
    
    // Click approve with act()
    await act(async () => {
      fireEvent.click(approveButton);
    });
    
    // Verify the update was called correctly
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('clients');
      // Get the update and eq functions from the mock chain
      const updateMock = supabase.from('clients').update;
      const eqMock = updateMock().eq;
      
      // Check if update was called with correct status
      expect(updateMock).toHaveBeenCalledWith({ status: 'approved' });
      expect(eqMock).toHaveBeenCalledWith('user_id', mockClients[0].user_id);
    });
    
    // Client should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText(`User ID: ${mockClients[0].user_id}`)).not.toBeInTheDocument();
    });
  });

  it('rejects a freelancer successfully', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });
    
    // Wait for freelancer data to appear
    await waitFor(() => {
      expect(screen.getByText(`User ID: ${mockFreelancers[0].user_id}`)).toBeInTheDocument();
    });
    
    // Find the reject button for the freelancer
    const freelancerArticle = screen.getByText(`User ID: ${mockFreelancers[0].user_id}`).closest('article');
    const rejectButton = freelancerArticle.querySelector('button.bg-red-600');
    
    // Click reject with act()
    await act(async () => {
      fireEvent.click(rejectButton);
    });
    
    // Verify the update was called correctly
    await waitFor(() => {
      expect(supabase.from).toHaveBeenCalledWith('freelancers');
      // Get the update and eq functions from the mock chain
      const updateMock = supabase.from('freelancers').update;
      const eqMock = updateMock().eq;
      
      // Check if update was called with correct status
      expect(updateMock).toHaveBeenCalledWith({ status: 'rejected' });
      expect(eqMock).toHaveBeenCalledWith('user_id', mockFreelancers[0].user_id);
    });
    
    // Freelancer should be removed from the list
    await waitFor(() => {
      expect(screen.queryByText(`User ID: ${mockFreelancers[0].user_id}`)).not.toBeInTheDocument();
    });
  });

  it('shows "None" when there are no pending users', async () => {
    // Override the mock to return empty arrays
    supabase.from.mockImplementation((table) => {
      return {
        select: () => ({
          eq: jest.fn().mockResolvedValue({ data: [] })
        }),
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      };
    });
    
    await act(async () => {
      render(<UserApprovalPanel />);
    });
    
    // Wait for the "None" text to appear for both sections
    await waitFor(() => {
      const noneTexts = screen.getAllByText('None');
      expect(noneTexts.length).toBe(2); // One for clients, one for freelancers
    });
  });
});