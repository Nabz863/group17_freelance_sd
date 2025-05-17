import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import UserApprovalPanel from './UserApprovalPanel';
import supabase from '../utils/supabaseClient';

jest.mock('../utils/supabaseClient', () => ({
  __esModule: true,
  default: { from: jest.fn() },
}));

describe('UserApprovalPanel', () => {
  const mockClients = [
    { user_id: 'client1', profile: { name: 'Test Client', email: 'client@test.com' } },
    { user_id: 'client2', profile: { name: 'Another Client', email: 'another@test.com' } },
  ];
  const mockFreelancers = [
    { user_id: 'freelancer1', profile: { name: 'Test Freelancer', skills: ['React'] } },
  ];

  beforeEach(() => {
    jest.clearAllMocks();

    const clientsEq = jest.fn().mockResolvedValue({ data: mockClients });
    const clientsSelect = jest.fn().mockReturnValue({ eq: clientsEq });

    const freelancersEq = jest.fn().mockResolvedValue({ data: mockFreelancers });
    const freelancersSelect = jest.fn().mockReturnValue({ eq: freelancersEq });

    const updateEq = jest.fn().mockResolvedValue({ data: null, error: null });
    const update = jest.fn().mockReturnValue({ eq: updateEq });

    supabase.from.mockImplementation((table) => {
      if (table === 'clients') {
        return { select: clientsSelect, update };
      } else if (table === 'freelancers') {
        return { select: freelancersSelect, update };
      }
      return { select: jest.fn(), update };
    });
  });

  it('renders both sections initially', () => {
    render(<UserApprovalPanel />);
    expect(screen.getByText('Pending Clients')).toBeInTheDocument();
    expect(screen.getByText('Pending Freelancers')).toBeInTheDocument();
  });

  it('displays pending clients and freelancers after fetch', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });

    await waitFor(() => {
      expect(screen.getByText(`User ID: ${mockClients[0].user_id}`)).toBeInTheDocument();
    });

    mockClients.forEach((c) => {
      expect(screen.getByText(`User ID: ${c.user_id}`)).toBeInTheDocument();
      expect(screen.getByText(`Profile: ${JSON.stringify(c.profile)}`)).toBeInTheDocument();
    });

    mockFreelancers.forEach((f) => {
      expect(screen.getByText(`User ID: ${f.user_id}`)).toBeInTheDocument();
      expect(screen.getByText(`Profile: ${JSON.stringify(f.profile)}`)).toBeInTheDocument();
    });
  });

  it('approves a client successfully', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });

    await waitFor(() => {
      expect(screen.getByText(`User ID: ${mockClients[0].user_id}`)).toBeInTheDocument();
    });

    const clientRow = screen
      .getByText(`User ID: ${mockClients[0].user_id}`)
      .closest('tr');
    const approveBtn = clientRow.querySelector('button.bg-green-600');

    await act(async () => {
      fireEvent.click(approveBtn);
    });

    expect(supabase.from).toHaveBeenCalledWith('clients');
    const updateMock = supabase.from('clients').update;
    expect(updateMock).toHaveBeenCalledWith({ status: 'approved' });
  });

  it('rejects a freelancer successfully', async () => {
    await act(async () => {
      render(<UserApprovalPanel />);
    });

    await waitFor(() => {
      expect(screen.getByText(`User ID: ${mockFreelancers[0].user_id}`)).toBeInTheDocument();
    });

    const freeRow = screen
      .getByText(`User ID: ${mockFreelancers[0].user_id}`)
      .closest('tr');
    const rejectBtn = freeRow.querySelector('button.bg-red-600');

    await act(async () => {
      fireEvent.click(rejectBtn);
    });

    expect(supabase.from).toHaveBeenCalledWith('freelancers');
    const updateMock = supabase.from('freelancers').update;
    expect(updateMock).toHaveBeenCalledWith({ status: 'rejected' });
  });

  it('shows "None" when there are no pending users', async () => {
    supabase.from.mockImplementation(() => ({
      select: () => ({ eq: jest.fn().mockResolvedValue({ data: [] }) }),
      update: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValue({ data: null, error: null }) }),
    }));

    await act(async () => {
      render(<UserApprovalPanel />);
    });

    await waitFor(() => {
      const none = screen.getAllByText('None');
      expect(none.length).toBe(2);
    });
  });
});