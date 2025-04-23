// AdminDashboard.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock the layout and child components
jest.mock("../components/DashboardLayout", () => (props) => {
  return (
    <div data-testid="dashboard-layout">
      <h1>Mock Dashboard - Role: {props.role}</h1>
      <div>{props.menuItems && props.menuItems.join(", ")}</div>
      {/* Render default content for test */}
      {props.contentMap["Requests"]}
    </div>
  );
});

jest.mock("../components/UserApprovalPanel", () => () => (
  <div data-testid="user-approval-panel">Mock UserApprovalPanel</div>
));

import AdminDashboard from "./AdminDashboard";

describe("AdminDashboard", () => {
  it("renders the admin dashboard layout with role and menu items", () => {
    render(<AdminDashboard />);

    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(screen.getByText(/Mock Dashboard - Role: Admin/i)).toBeInTheDocument();
    expect(screen.getByText(/Requests, Freelancers, Clients, Projects, Payments, Reports, Account Settings/)).toBeInTheDocument();
  });

  it("renders the default Requests section with user approval panel", () => {
    render(<AdminDashboard />);

    expect(screen.getByRole("heading", { name: /User Approval Requests/i })).toBeInTheDocument();
    expect(screen.getByText(/Review and approve pending client and freelancer profiles/i)).toBeInTheDocument();
    expect(screen.getByTestId("user-approval-panel")).toBeInTheDocument();
  });
});
