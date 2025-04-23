import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockNavigate } from "react-router-dom";

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

import FreelancerProfileForm from "./FreelancerProfileForm";

describe("FreelancerProfileForm", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the form after loading", async () => {
    render(<FreelancerProfileForm />);
    expect(screen.getByText(/Loading your profile form/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByRole("heading", { name: /Freelancer Profile/i })
      ).toBeInTheDocument()
    );
  });

  it("submits and navigates on success", async () => {
    render(<FreelancerProfileForm />);
    await waitFor(() => screen.getByLabelText(/First Name/i));

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
