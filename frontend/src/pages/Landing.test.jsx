import { render, screen, fireEvent } from '@testing-library/react';
import Landing from './Landing';

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    loginWithRedirect: jest.fn()
  })
}));

test('renders Landing component and handles "Get Started" click', () => {
  const mockLoginWithRedirect = jest.fn();

  // override the mocked useAuth0 for this specific test
  jest.mocked(require('@auth0/auth0-react').useAuth0).mockReturnValue({
    loginWithRedirect: mockLoginWithRedirect
  });

  render(<Landing />);

  expect(screen.getByText(/The Gig Is Up/i)).toBeInTheDocument();
  expect(screen.getByText(/Connect, collaborate, and get paid/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Get Started/i })).toBeInTheDocument();

  const button = screen.getByRole('button', { name: /Get Started/i });
  fireEvent.click(button);

  expect(mockLoginWithRedirect).toHaveBeenCalled();
});
