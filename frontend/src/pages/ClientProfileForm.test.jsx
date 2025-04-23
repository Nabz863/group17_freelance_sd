import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

jest.mock(
  "react-router-dom",
  () => ({
    __esModule: true,
    useNavigate: () => jest.fn(),
  }),
  { virtual: true }
);

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { sub: "test-user-id" },
    isLoading: false,
  }),
}));

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

    expect(screen.getByText(/Loading your profile form/i)).toBeInTheDocument();

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
