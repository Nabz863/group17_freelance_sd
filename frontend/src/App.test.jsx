// App.test.jsx
import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { useAuth0 } from "@auth0/auth0-react";
import { useNavigate, useLocation } from "react-router-dom";
import supabase from "./utils/supabaseClient";
import App from "./App";

// Mock the dependencies
jest.mock("@auth0/auth0-react");
jest.mock("react-router-dom", () => ({
  useNavigate: jest.fn(),
  useLocation: jest.fn()
}));
jest.mock("./utils/supabaseClient", () => ({
  from: jest.fn()
}));
jest.mock("./routes", () => () => <div data-testid="routes-component">Routes Component</div>);

// Helper to setup mocks for different test scenarios
const setupMocks = ({
  isAuthenticated = false,
  isLoading = false,
  user = null,
  location = { pathname: "/" },
  supabaseResponse = { data: null }
}) => {
  // Mock Auth0
  const loginWithRedirect = jest.fn();
  useAuth0.mockReturnValue({
    isAuthenticated,
    isLoading,
    user,
    loginWithRedirect
  });

  // Mock React Router
  const navigate = jest.fn();
  useNavigate.mockReturnValue(navigate);
  useLocation.mockReturnValue(location);

  // Mock Supabase
  const mockSelect = jest.fn().mockReturnValue({
    eq: jest.fn().mockReturnValue({
      maybeSingle: jest.fn().mockResolvedValue(supabaseResponse)
    })
  });
  const mockFrom = jest.fn().mockReturnValue({
    select: mockSelect
  });
  supabase.from.mockImplementation(mockFrom);

  return {
    navigate,
    loginWithRedirect,
    mockFrom,
    mockSelect
  };
};

// Reset all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
  process.env.REACT_APP_AUTH0_ADMIN_ID = "admin-user-id";
});

describe("App Component", () => {
  it("renders loading state when Auth0 is loading", () => {
    setupMocks({ isLoading: true });
    
    render(<App />);
    
    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("redirects to login when user is not authenticated and not on public path", () => {
    const { loginWithRedirect } = setupMocks({
      isAuthenticated: false,
      location: { pathname: "/some-protected-path" }
    });
    
    render(<App />);
    
    expect(loginWithRedirect).toHaveBeenCalled();
  });

  it("doesn't redirect to login when user is not authenticated but on public path", () => {
    const { loginWithRedirect } = setupMocks({
      isAuthenticated: false,
      location: { pathname: "/" }
    });
    
    render(<App />);
    
    expect(loginWithRedirect).not.toHaveBeenCalled();
  });

  it("redirects admin user to admin dashboard", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "admin-user-id" },
      location: { pathname: "/some-path" }
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/admin");
    });
  });

  it("doesn't redirect admin if already on admin page", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "admin-user-id" },
      location: { pathname: "/admin" }
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it("redirects to verify email page if email is not verified", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "regular-user", email_verified: false },
      location: { pathname: "/some-path" }
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/verify-email");
    });
  });

  it("redirects to register role page if user has no role", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "regular-user", email_verified: true },
      location: { pathname: "/some-path" }
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/register-role");
    });
  });

  it("redirects client without profile to create profile page", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "client-user", email_verified: true },
      location: { pathname: "/some-path" },
      supabaseResponse: { data: { status: null, profile: null } }
    });
    
    // Mock Supabase to return client data for first call and null for second call
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { status: null, profile: null } })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/create-client-profile");
    });
  });

  it("redirects freelancer without profile to create profile page", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "freelancer-user", email_verified: true },
      location: { pathname: "/some-path" }
    });
    
    // Mock Supabase to return null for client and freelancer data for second call
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { status: null, profile: null } })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/create-freelancer-profile");
    });
  });

  it("redirects to pending page when user has profile but not approved", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "client-user", email_verified: true },
      location: { pathname: "/some-path" }
    });
    
    // Mock Supabase to return client with profile but pending status
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { status: "pending", profile: { name: "Test User" } } })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/pending");
    });
  });

  it("redirects to client dashboard when client is approved and on non-protected path", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "client-user", email_verified: true },
      location: { pathname: "/some-path" }
    });
    
    // Mock Supabase to return approved client with profile
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { status: "approved", profile: { name: "Test User" } } })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/client");
    });
  });

  it("redirects to freelancer dashboard when freelancer is approved and on non-protected path", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "freelancer-user", email_verified: true },
      location: { pathname: "/some-path" }
    });
    
    // Mock Supabase to return null for client and approved freelancer with profile
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: null })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: { status: "approved", profile: { name: "Test User" } } })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/freelancer");
    });
  });

  it("doesn't redirect when user is on a protected path", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "client-user", email_verified: true },
      location: { pathname: "/client" }
    });
    
    // Mock Supabase to return approved client with profile
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { status: "approved", profile: { name: "Test User" } } })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).not.toHaveBeenCalled();
    });
  });

  it("navigates to error page when Supabase query fails", async () => {
    const { navigate } = setupMocks({
      isAuthenticated: true,
      user: { sub: "regular-user", email_verified: true }
    });
    
    // Mock Supabase to throw an error
    supabase.from.mockImplementation(() => {
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockRejectedValue(new Error("Database error"))
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(navigate).toHaveBeenCalledWith("/error");
    });
  });

  it("renders the routes component when authenticated and processed", async () => {
    setupMocks({
      isAuthenticated: true,
      user: { sub: "client-user", email_verified: true },
      location: { pathname: "/client" }
    });
    
    // Mock Supabase to return approved client with profile
    supabase.from.mockImplementation((table) => {
      if (table === "clients") {
        return {
          select: jest.fn().mockReturnValue({
            eq: jest.fn().mockReturnValue({
              maybeSingle: jest.fn().mockResolvedValue({ data: { status: "approved", profile: { name: "Test User" } } })
            })
          })
        };
      }
      return {
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            maybeSingle: jest.fn().mockResolvedValue({ data: null })
          })
        })
      };
    });
    
    render(<App />);
    
    await waitFor(() => {
      expect(screen.getByTestId("routes-component")).toBeInTheDocument();
    });
  });
});
