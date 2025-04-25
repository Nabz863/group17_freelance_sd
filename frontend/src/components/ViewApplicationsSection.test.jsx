jest.mock('../utils/supabaseClient', () => ({
    __esModule: true,
    default: {
      from: jest.fn(),
    },
  }));
  
  import React from 'react';
  import {
    render,
    screen,
    waitFor,
    fireEvent,
  } from '@testing-library/react';
  import ViewApplicationsSection from './ViewApplicationsSection';
  import { useAuth0 } from '@auth0/auth0-react';
  import supabase from '../utils/supabaseClient';
  
  jest.mock('@auth0/auth0-react');
  
  describe('ViewApplicationsSection', () => {
    beforeAll(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {});
      jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });
    afterAll(() => {
      console.warn.mockRestore();
      console.error.mockRestore();
      console.log.mockRestore();
    });
  
    beforeEach(() => {
      jest.clearAllMocks();
      useAuth0.mockReturnValue({ user: { sub: 'client-1' } });
    });
    function mockSupabaseFetch(appsData, error = null) {
      const builderFetch = {
        select: jest.fn(() => builderFetch),
        eq:     jest.fn(() => builderFetch),
        then:  (cb) => cb({ data: appsData, error }),
      };
      supabase.from.mockImplementation((table) => {
        if (table === 'projects') return builderFetch;
        throw new Error(`Unexpected table: ${table}`);
      });
    }
    function mockSupabaseAssign(updateError = null) {
      const builderUpdate = {
        update: jest.fn(() => builderUpdate),
        eq:     jest.fn(() => builderUpdate),
        then:   (cb) => cb({ error: updateError }),
      };
      supabase.from.mockImplementation((table) => {
        if (table === 'projects') return builderUpdate;
        throw new Error(`Unexpected table: ${table}`);
      });
    }
  
    it('renders loading state initially', () => {
      mockSupabaseFetch([], null);
      render(<ViewApplicationsSection />);
      expect(
        screen.getByText(/Loading applications\.\.\./i)
      ).toBeInTheDocument();
    });
  
    it('shows "No jobs found." when API returns empty list', async () => {
      mockSupabaseFetch([], null);
      render(<ViewApplicationsSection />);
      await waitFor(() => {
        expect(screen.getByText(/No jobs found\./i)).toBeInTheDocument();
      });
    });
  
    it('renders jobs and can expand/collapse applicants', async () => {
      const desc = JSON.stringify({ title: 'Job A', details: 'Details A' });
      const job = {
        id: 42,
        description: desc,
        client_id: 'client-1',
        freelancer_id: null,
        applications: [],
      };
      mockSupabaseFetch([job], null);
  
      render(<ViewApplicationsSection />);
      await waitFor(() => {
        expect(screen.getByText('Job A')).toBeInTheDocument();
      });
  
      const toggleBtn = screen.getByRole('button', {
        name: /View Applicants/i,
      });
      fireEvent.click(toggleBtn);
      expect(screen.getByText(/No applicants yet\./i)).toBeInTheDocument();
  
      fireEvent.click(toggleBtn);
      expect(
        screen.queryByText(/No applicants yet\./i)
      ).not.toBeInTheDocument();
    });
  
    it('renders applicants and handles assign action', async () => {
      const desc = JSON.stringify({ title: 'Job B', details: 'D B' });
      const profile = JSON.stringify({
        firstName: 'Alice',
        lastName: 'Smith',
        profession: 'Developer',
        email: 'alice@example.com',
      });
      const job = {
        id: 7,
        description: desc,
        client_id: 'client-1',
        freelancer_id: null,
        applications: [
          { freelancerid: 'f1', status: 'pending', freelancer: { profile } },
        ],
      };
      mockSupabaseFetch([job], null);
  
      render(<ViewApplicationsSection />);
      await waitFor(() => screen.getByText('Job B'));
  
      fireEvent.click(screen.getByRole('button', { name: /View Applicants/i }));
  
      expect(screen.getByText('Alice Smith')).toBeInTheDocument();
      expect(screen.getByText(/Developer/i)).toBeInTheDocument();
      expect(screen.getByText(/alice@example\.com/i)).toBeInTheDocument();
  
      mockSupabaseAssign(null);
      const assignBtn = screen.getByRole('button', {
        name: /Assign Freelancer/i,
      });
      fireEvent.click(assignBtn);
  
      expect(supabase.from).toHaveBeenCalledWith('projects');
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: /Assigning\.\.\./i })
        ).toBeInTheDocument();
      });
    });
  
    it('logs error when fetchApplications fails', async () => {
      const spy = jest.spyOn(console, 'error');
      mockSupabaseFetch(null, new Error('fetch error'));
  
      render(<ViewApplicationsSection />);
      await waitFor(() => {
        expect(spy).toHaveBeenCalledWith(
          'Error loading job applications:',
          expect.any(Error)
        );
      });
    });
  });