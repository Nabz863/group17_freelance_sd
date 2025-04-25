import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Landing from './Landing';
import { useAuth0 } from '@auth0/auth0-react';

jest.mock('@auth0/auth0-react');

describe('Landing', () => {
  it('renders correctly and calls loginWithRedirect on click', () => {
    const mockLogin = jest.fn();
    useAuth0.mockReturnValue({ loginWithRedirect: mockLogin });

    render(<Landing />);

    expect(screen.getByText(/The Gig Is Up/i)).toBeInTheDocument();
    expect(screen.getByText(/Connect, collaborate, and get paid/i)).toBeInTheDocument();

    const btn = screen.getByRole('button', { name: /Get Started/i });
    expect(btn).toBeInTheDocument();

    fireEvent.click(btn);
    expect(mockLogin).toHaveBeenCalled();
  });
});