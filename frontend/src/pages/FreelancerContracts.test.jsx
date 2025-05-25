import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import FreelancerContracts from './FreelancerContracts';
import { listContracts, updateContractStatus, downloadContractPdf } from '../services/contractAPI';

// Mock dependencies
jest.mock('../services/contractAPI');

describe('FreelancerContracts', () => {
  const mockContracts = [
    { id: '1', title: 'Contract A', status: 'pending' },
    { id: '2', title: 'Contract B', status: 'accepted' },
    { id: '3', title: 'Contract C', status: 'pending' },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    listContracts.mockResolvedValue(mockContracts);
    updateContractStatus.mockResolvedValue(undefined);
    downloadContractPdf.mockResolvedValue(undefined);
  });

  it('renders loading state initially', () => {
    render(<FreelancerContracts />);
    expect(screen.getByText('Pending Contracts')).toBeInTheDocument();
    expect(screen.queryByText('Contract A')).not.toBeInTheDocument();
  });

  it('renders pending contracts', async () => {
    render(<FreelancerContracts />);
    await waitFor(() => {
      expect(screen.getByText('Contract A')).toBeInTheDocument();
      expect(screen.getByText('Contract C')).toBeInTheDocument();
      expect(screen.queryByText('Contract B')).not.toBeInTheDocument();
      expect(screen.getAllByText('Accept')).toHaveLength(2);
      expect(screen.getAllByText('Reject')).toHaveLength(2);
      expect(screen.getAllByText('View PDF')).toHaveLength(2);
    });
  });

  it('renders no contracts when none are pending', async () => {
    listContracts.mockResolvedValue([{ id: '2', title: 'Contract B', status: 'accepted' }]);
    render(<FreelancerContracts />);
    await waitFor(() => {
      expect(screen.queryByText('Contract B')).not.toBeInTheDocument();
      expect(screen.queryByText('Accept')).not.toBeInTheDocument();
    });
  });

  it('handles accept button click', async () => {
    const updatedContracts = [
      { id: '1', title: 'Contract A', status: 'accepted' },
      { id: '3', title: 'Contract C', status: 'pending' },
    ];
    listContracts.mockResolvedValueOnce(mockContracts).mockResolvedValueOnce(updatedContracts);

    render(<FreelancerContracts />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Accept')[0]);
    });

    await waitFor(() => {
      expect(updateContractStatus).toHaveBeenCalledWith('1', 'accepted');
      expect(listContracts).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Contract A')).not.toBeInTheDocument();
      expect(screen.getByText('Contract C')).toBeInTheDocument();
    });
  });

  it('handles reject button click', async () => {
    const updatedContracts = [
      { id: '1', title: 'Contract A', status: 'rejected' },
      { id: '3', title: 'Contract C', status: 'pending' },
    ];
    listContracts.mockResolvedValueOnce(mockContracts).mockResolvedValueOnce(updatedContracts);

    render(<FreelancerContracts />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('Reject')[0]);
    });

    await waitFor(() => {
      expect(updateContractStatus).toHaveBeenCalledWith('1', 'rejected');
      expect(listContracts).toHaveBeenCalledTimes(2);
      expect(screen.queryByText('Contract A')).not.toBeInTheDocument();
      expect(screen.getByText('Contract C')).toBeInTheDocument();
    });
  });

  it('handles view PDF button click', async () => {
    render(<FreelancerContracts />);
    await waitFor(() => {
      fireEvent.click(screen.getAllByText('View PDF')[0]);
    });

    expect(downloadContractPdf).toHaveBeenCalledWith('1');
  });

  it('handles contract fetch error', async () => {
    listContracts.mockRejectedValue(new Error('Fetch failed'));
    const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
    render(<FreelancerContracts />);
    await waitFor(() => {
      expect(screen.queryByText('Contract A')).not.toBeInTheDocument();
      expect(consoleError).toHaveBeenCalled();
    });
    consoleError.mockRestore();
  });
});