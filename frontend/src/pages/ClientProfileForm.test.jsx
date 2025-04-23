// src/pages/ClientProfileForm.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

// 1) Declare react-router-dom as a virtual mock
jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

// 2) Stub out Auth0
jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { sub: "test-user-id" },
    isLoading: false,
  }),
}));

// 3) Stub out your Supabase client
jest.mock("../utils/supabaseClient", () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: { profile: {} }, error: null }),
      }),
    }),
    update: () => ({
      eq: () => Promise.resolve({ error: null }),
    }),
  }),
}));

import ClientProfileForm from "./ClientProfileForm";

describe("ClientProfileForm", () => {
  it("shows loading then renders the form title", async () => {
    render(<ClientProfileForm />);

    // initial loading message
    expect(screen.getByText(/Loading your profile form/i)).toBeInTheDocument();

    // after the mock supabase check, the form title appears
    await waitFor(() => {
      expect(
        screen.getByRole("heading", { name: /Client Profile/i })
      ).toBeInTheDocument();
    });
  });

  it("renders the key input fields", async () => {
    render(<ClientProfileForm />);

    await waitFor(() =>
      screen.getByRole("heading", { name: /Client Profile/i })
    );

    expect(screen.getByLabelText(/First Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Last Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Industry\/Sector/i)).toBeInTheDocument();
  });
});
