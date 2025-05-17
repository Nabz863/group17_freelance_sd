import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockNavigate } from "react-router-dom";

import FreelancerProfileForm from "./FreelancerProfileForm";

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ user: { sub: "test-user" } }),
}));

jest.mock("../utils/supabaseClient", () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: { profile: {} }, error: null }),
      }),
    }),
    update: () => ({
      eq: async () => ({ error: null }),
    }),
  }),
}));

describe("FreelancerProfileForm", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the form after loading", async () => {
    render(<FreelancerProfileForm />);
    expect(screen.getByText(/Loading your profile form/i)).toBeInTheDocument();
    await screen.findByRole("heading", { name: /Freelancer Profile/i });
  });

  it("submits and navigates on success", async () => {
    render(<FreelancerProfileForm />);
    await screen.findByLabelText(/First Name/i);

    userEvent.type(screen.getByLabelText(/First Name/i), "Alice");
    userEvent.type(screen.getByLabelText(/Last Name/i), "Smith");
    userEvent.type(screen.getByLabelText(/Profession/i), "Dev");

    userEvent.click(
      screen.getByRole("button", { name: /Submit Profile/i })
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/pending");
    });
  });
});
