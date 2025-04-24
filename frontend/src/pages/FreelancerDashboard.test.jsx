import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import FreelancerDashboard from "./FreelancerDashboard";

// ✅ Mock supabaseClient since ApplyJobSection depends on it
jest.mock("../utils/supabaseClient", () => ({
  from: () => ({
    select: () => ({
      eq: () => ({
        maybeSingle: async () => ({ data: {}, error: null }),
      }),
    }),
  }),
}));

// ✅ Also mock ApplyJobSection to avoid loading unrelated logic
jest.mock("../components/ApplyJobSection", () => () => (
  <div>Mocked ApplyJobSection</div>
));

// Mock window.innerWidth before tests
beforeAll(() => {
  Object.defineProperty(window, "innerWidth", {
    writable: true,
    configurable: true,
    value: 1024,
  });
});

describe("FreelancerDashboard", () => {
  it("renders default section and sidebar", () => {
    render(<FreelancerDashboard />);
    expect(screen.getByRole("heading", { name: /Account Settings/i })).toBeInTheDocument();
    expect(screen.getByText("Freelancers")).toBeInTheDocument();
  });

  it("toggles sidebar visibility on hamburger click", () => {
    render(<FreelancerDashboard />);
    const sidebar = screen.getByText("Freelancers").parentElement;
    const toggleBtn = screen.getByLabelText(/Toggle navigation menu/i);
    
    fireEvent.click(toggleBtn);
    expect(sidebar).toHaveClass("dashboard-sidebar hidden");

    fireEvent.click(toggleBtn);
    expect(sidebar).not.toHaveClass("hidden");
  });

  it("switches to the 'Clients' section when clicked", () => {
    render(<FreelancerDashboard />);
    fireEvent.click(screen.getByRole("button", { name: /Clients/i }));
    expect(screen.getByRole("heading", { name: /Clients/i })).toBeInTheDocument();
  });

  it("closes sidebar on section select when screen is narrow", () => {
    window.innerWidth = 800;
    render(<FreelancerDashboard />);
    const sidebar = screen.getByText("Freelancers").parentElement;

    fireEvent.click(screen.getByRole("button", { name: /Inbox/i }));
    expect(screen.getByRole("heading", { name: /Inbox/i })).toBeInTheDocument();
    expect(sidebar).toHaveClass("dashboard-sidebar hidden");
  });
});
