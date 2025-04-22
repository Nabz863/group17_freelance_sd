import { render, screen, fireEvent } from '@testing-library/react';
import PostJobForm from './PostJobForm';
jest.mock("../utils/supabaseClient");

jest.mock('@auth0/auth0-react', () => ({
  useAuth0: () => ({
    user: { sub: 'test-user-id' }
  })
}));

test('renders PostJobForm and allows input', () => {
  render(<PostJobForm />);

  expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Project Description/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Requirements/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Budget/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/Deadline/i)).toBeInTheDocument();

  fireEvent.change(screen.getByLabelText(/Job Title/i), {
    target: { value: 'Test Job Title' },
  });

  fireEvent.change(screen.getByLabelText(/Project Description/i), {
    target: { value: 'This is a test description.' },
  });

  fireEvent.change(screen.getByLabelText(/Budget/i), {
    target: { value: '2000' },
  });

  expect(screen.getByDisplayValue('Test Job Title')).toBeInTheDocument();
  expect(screen.getByDisplayValue('This is a test description.')).toBeInTheDocument();
  expect(screen.getByDisplayValue('2000')).toBeInTheDocument();
});