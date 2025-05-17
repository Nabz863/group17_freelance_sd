// CreateProfile.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";

import CreateProfile from "./CreateProfile";

const mockNavigate = jest.fn();

jest.mock("react-router-dom", () => ({
  __esModule: true,
  useNavigate: () => mockNavigate,
}));

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({
    user: { sub: "test-user-id" },
    isLoading: false,
  }),
}));

jest.mock("../utils/supabaseClient", () => ({
  from: (table) => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => {
          if (table === "clients") return { data: null }; // mock no client
          if (table === "freelancers") return { data: null }; // mock no freelancer
        },
      }),
    }),
  }),
}));

describe("CreateProfile", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders loading message initially", () => {
    render(<CreateProfile />);
    expect(screen.getByText(/Checking your role/i)).toBeInTheDocument();
  });

  it("redirects to /register-role when no role is found", async () => {
    render(<CreateProfile />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/register-role");
    });
  });

  it("redirects to /create-client-profile if client data exists", async () => {
    const supabase = require("../utils/supabaseClient");
    supabase.from = (table) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (table === "clients") return { data: { user_id: "test-user-id" } };
            return { data: null };
          },
        }),
      }),
    });

    render(<CreateProfile />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-client-profile");
    });
  });

  it("redirects to /create-freelancer-profile if freelancer data exists", async () => {
    const supabase = require("../utils/supabaseClient");
    supabase.from = (table) => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => {
            if (table === "freelancers") return { data: { user_id: "test-user-id" } };
            return { data: null };
          },
        }),
      }),
    });

    render(<CreateProfile />);
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-freelancer-profile");
    });
  });
});
