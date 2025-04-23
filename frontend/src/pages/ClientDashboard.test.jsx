// ClientDashboard.test.jsx
import React from "react";
import { render, screen } from "@testing-library/react";

// Mock subcomponents
jest.mock("../components/DashboardLayout", () => (props) => {
  return (
    <div data-testid="dashboard-layout">
      <h1>Mock Dashboard - Role: {props.role}</h1>
      <div>{props.menuItems && props.menuItems.join(", ")}</div>
      {/* Render default content for test */}
      {props.contentMap["Account Settings"]}
    </div>
  );
});

jest.mock("./PostJobForm", () => () => (
  <div data-testid="post-job-form">Mock PostJobForm</div>
));

jest.mock("../components/ViewApplicationsSection", () => () => (
  <div data-testid="view-applications">Mock ViewApplicationsSection</div>
));

import ClientDashboard from "./ClientDashboard";

describe("ClientDashboard", () => {
  it("renders the client dashboard with correct role and menu items", () => {
    render(<ClientDashboard />);

    expect(screen.getByTestId("dashboard-layout")).toBeInTheDocument();
    expect(screen.getByText(/Mock Dashboard - Role: Clients/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Settings, Freelancers, Inbox, Payments, Projects, Post a Job, Applications/)).toBeInTheDocument();
  });

  it("renders the default Account Settings section", () => {
    render(<ClientDashboard />);

    expect(screen.getByRole("heading", { name: /Account Settings/i })).toBeInTheDocument();
    expect(screen.getByText(/Edit profile, password and more/i)).toBeInTheDocument();
  });
});
