import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { mockNavigate } from "react-router-dom";

import RegisterRole from "./RegisterRole";

jest.mock("@auth0/auth0-react", () => ({
  useAuth0: () => ({ user: { sub: "test-user" } }),
}));

jest.mock("../utils/supabaseClient", () => ({
  from: () => ({
    insert: () => ({
      select: async () => ({ error: null }),
    }),
  }),
}));

describe("RegisterRole", () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  it("renders the role selection form", () => {
    render(<RegisterRole />);
    expect(screen.getByText(/Choose Your Role/i)).toBeInTheDocument();
    expect(screen.getByText(/Client – Post and manage projects/i)).toBeInTheDocument();
    expect(screen.getByText(/Freelancer – Apply and get hired/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Continue/i })).toBeInTheDocument();
  });

  it("selects client role by default", () => {
    render(<RegisterRole />);
    const clientRadio = screen.getByLabelText(/Client – Post and manage projects/i);
    const freelancerRadio = screen.getByLabelText(/Freelancer – Apply and get hired/i);
    
    expect(clientRadio).toBeChecked();
    expect(freelancerRadio).not.toBeChecked();
  });

  it("allows changing role selection", async () => {
    render(<RegisterRole />);
    const freelancerRadio = screen.getByLabelText(/Freelancer – Apply and get hired/i);
    
    userEvent.click(freelancerRadio);
    
    expect(freelancerRadio).toBeChecked();
    expect(screen.getByLabelText(/Client – Post and manage projects/i)).not.toBeChecked();
  });

  it("submits client role and navigates on success", async () => {
    render(<RegisterRole />);
    
    // Client role is selected by default
    userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-profile");
    });
  });

  it("submits freelancer role and navigates on success", async () => {
    render(<RegisterRole />);
    
    const freelancerRadio = screen.getByLabelText(/Freelancer – Apply and get hired/i);
    userEvent.click(freelancerRadio);
    userEvent.click(screen.getByRole("button", { name: /Continue/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith("/create-profile");
    });
  });
});