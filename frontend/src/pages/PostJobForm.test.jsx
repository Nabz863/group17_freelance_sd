import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import supabase from '../utils/supabaseClient';
import PostJobForm from './PostJobForm';

// Mock dependencies
jest.mock('@auth0/auth0-react');
jest.mock('react-router-dom', () => ({
  useNavigate: jest.fn(),
}));
jest.mock('../utils/supabaseClient');

describe('PostJobForm', () => {
  const mockNavigate = jest.fn();
  const mockUser = { sub: 'test-user-id' };

  beforeEach(() => {
    jest.clearAllMocks();
    useAuth0.mockReturnValue({ user: mockUser });
    useNavigate.mockReturnValue(mockNavigate);
    supabase.from.mockImplementation((table) => {
      if (table === 'projects') {
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({
            data: { id: 'project123' },
            error: null,
          }),
        };
      }
      if (table === 'milestones') {
        return {
          insert: jest.fn().mockResolvedValue({ error: null }),
        };
      }
      return {};
    });
  });

  it('renders form fields and milestone section', () => {
    render(<PostJobForm />);
    expect(screen.getByLabelText(/Job Title:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Project Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Requirements:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Budget \(ZAR\):/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Deadline:/i)).toBeInTheDocument();
    expect(screen.getByText(/Milestones/i)).toBeInTheDocument();
    expect(screen.getByText(/Milestone 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Milestone/i)).toBeInTheDocument();
    expect(screen.getByText(/Submit Job/i)).toBeInTheDocument();
  });

  it('renders header when not embedded', () => {
    render(<PostJobForm embed={false} />);
    expect(screen.getByText(/Post a New Job/i)).toBeInTheDocument();
    expect(screen.getByText(/Describe your project/i)).toBeInTheDocument();
    expect(screen.getByText(/Cancel/i)).toBeInTheDocument();
  });

  it('hides header and Cancel button when embedded', () => {
    render(<PostJobForm embed={true} />);
    expect(screen.queryByText(/Post a New Job/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Cancel/i)).not.toBeInTheDocument();
  });

  it('updates form fields on input', () => {
    render(<PostJobForm />);
    fireEvent.change(screen.getByLabelText(/Job Title:/i), {
      target: { value: 'Test Job' },
    });
    fireEvent.change(screen.getByLabelText(/Project Description:/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/Requirements:/i), {
      target: { value: 'Test requirements' },
    });
    fireEvent.change(screen.getByLabelText(/Budget \(ZAR\):/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), {
      target: { value: '2025-12-31' },
    });

    expect(screen.getByDisplayValue('Test Job')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test description')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Test requirements')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-12-31')).toBeInTheDocument();
  });

  it('updates milestone fields on input', () => {
    render(<PostJobForm />);
    const milestoneTitle = screen.getAllByLabelText(/Title/i)[0];
    const milestoneAmount = screen.getAllByLabelText(/Amount \(ZAR\)/i)[0];
    const milestoneDueDate = screen.getAllByLabelText(/Due Date/i)[0];

    fireEvent.change(milestoneTitle, { target: { value: 'Milestone 1' } });
    fireEvent.change(milestoneAmount, { target: { value: '1000' } });
    fireEvent.change(milestoneDueDate, { target: { value: '2025-11-30' } });

    expect(screen.getByDisplayValue('Milestone 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1000')).toBeInTheDocument();
    expect(screen.getByDisplayValue('2025-11-30')).toBeInTheDocument();
  });

  it('adds a new milestone', () => {
    render(<PostJobForm />);
    expect(screen.getAllByText(/Milestone \d+/i)).toHaveLength(1);
    fireEvent.click(screen.getByText(/Add Milestone/i));
    expect(screen.getAllByText(/Milestone \d+/i)).toHaveLength(2);
    expect(screen.getByText(/Milestone 2/i)).toBeInTheDocument();
  });

  it('removes a milestone', () => {
    render(<PostJobForm />);
    fireEvent.click(screen.getByText(/Add Milestone/i));
    expect(screen.getAllByText(/Milestone \d+/i)).toHaveLength(2);
    fireEvent.click(screen.getAllByText(/Remove/i)[1]);
    expect(screen.getAllByText(/Milestone \d+/i)).toHaveLength(1);
    expect(screen.queryByText(/Milestone 2/i)).not.toBeInTheDocument();
  });

  it('prevents removing the last milestone', () => {
    render(<PostJobForm />);
    expect(screen.getAllByText(/Milestone \d+/i)).toHaveLength(1);
    const removeButton = screen.getByText(/Remove/i);
    expect(removeButton).toBeDisabled();
    fireEvent.click(removeButton);
    expect(screen.getAllByText(/Milestone \d+/i)).toHaveLength(1);
  });

  it('submits form successfully', async () => {
    render(<PostJobForm />);
    fireEvent.change(screen.getByLabelText(/Job Title:/i), {
      target: { value: 'Test Job' },
    });
    fireEvent.change(screen.getByLabelText(/Project Description:/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/Budget \(ZAR\):/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), {
      target: { value: '2025-12-31' },
    });
    fireEvent.change(screen.getAllByLabelText(/Title/i)[0], {
      target: { value: 'Milestone 1' },
    });
    fireEvent.change(screen.getAllByLabelText(/Amount \(ZAR\)/i)[0], {
      target: { value: '1000' },
    });
    fireEvent.change(screen.getAllByLabelText(/Due Date/i)[0], {
      target: { value: '2025-11-30' },
    });

    fireEvent.click(screen.getByText(/Submit Job/i));

    await waitFor(() => {
      expect(supabase.from().insert).toHaveBeenCalledWith({
        client_id: 'test-user-id',
        description: JSON.stringify({
          title: 'Test Job',
          details: 'Test description',
          requirements: '',
          budget: '5000',
          deadline: '2025-12-31',
        }),
        completed: false,
      });
      expect(supabase.from().insert).toHaveBeenCalledWith([
        {
          project_id: 'project123',
          title: 'Milestone 1',
          due_date: '2025-11-30',
          amount: 1000,
        },
      ]);
      expect(screen.getByText(/Job Posted Successfully/i)).toBeInTheDocument();
      expect(screen.getByText(/Your job is now live/i)).toBeInTheDocument();
    });
  });

  it('handles submission error', async () => {
    supabase.from.mockImplementation(() => ({
      insert: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: null, error: new Error('Insert failed') }),
    }));

    render(<PostJobForm />);
    fireEvent.change(screen.getByLabelText(/Job Title:/i), {
      target: { value: 'Test Job' },
    });
    fireEvent.change(screen.getByLabelText(/Project Description:/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/Budget \(ZAR\):/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), {
      target: { value: '2025-12-31' },
    });

    fireEvent.click(screen.getByText(/Submit Job/i));

    await waitFor(() => {
      expect(screen.getByText(/Insert failed/i)).toBeInTheDocument();
      expect(screen.getByText(/Submit Job/i)).toBeInTheDocument();
    });
  });

  it('disables submit button while submitting', async () => {
    render(<PostJobForm />);
    fireEvent.change(screen.getByLabelText(/Job Title:/i), {
      target: { value: 'Test Job' },
    });
    fireEvent.change(screen.getByLabelText(/Project Description:/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/Budget \(ZAR\):/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), {
      target: { value: '2025-12-31' },
    });

    const submitButton = screen.getByText(/Submit Job/i);
    fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent(/Posting…/i);

    await waitFor(() => {
      expect(submitButton).not.toBeDisabled();
    });
  });

  it('navigates to dashboard on Cancel click (non-embedded)', () => {
    render(<PostJobForm embed={false} />);
    fireEvent.click(screen.getByText(/Cancel/i));
    expect(mockNavigate).toHaveBeenCalledWith('/client');
  });

  it('navigates to dashboard after successful submission (non-embedded)', async () => {
    render(<PostJobForm embed={false} />);
    fireEvent.change(screen.getByLabelText(/Job Title:/i), {
      target: { value: 'Test Job' },
    });
    fireEvent.change(screen.getByLabelText(/Project Description:/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/Budget \(ZAR\):/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), {
      target: { value: '2025-12-31' },
    });

    fireEvent.click(screen.getByText(/Submit Job/i));

    await waitFor(() => {
      fireEvent.click(screen.getByText(/Back to Dashboard/i));
      expect(mockNavigate).toHaveBeenCalledWith('/client');
    });
  });

  it('skips milestone insertion if none are filled', async () => {
    render(<PostJobForm />);
    fireEvent.change(screen.getByLabelText(/Job Title:/i), {
      target: { value: 'Test Job' },
    });
    fireEvent.change(screen.getByLabelText(/Project Description:/i), {
      target: { value: 'Test description' },
    });
    fireEvent.change(screen.getByLabelText(/Budget \(ZAR\):/i), {
      target: { value: '5000' },
    });
    fireEvent.change(screen.getByLabelText(/Deadline:/i), {
      target: { value: '2025-12-31' },
    });

    fireEvent.click(screen.getByText(/Submit Job/i));

    await waitFor(() => {
      expect(supabase.from().insert).toHaveBeenCalledTimes(1); // Only project insert
      expect(screen.getByText(/Job Posted Successfully/i)).toBeInTheDocument();
    });
  });
});