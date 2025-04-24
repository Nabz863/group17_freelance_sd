import React from "react";
import { render, screen } from "@testing-library/react";
import PendingApproval from "./PendingApproval";

describe("PendingApproval", () => {
  beforeEach(() => {
    render(<PendingApproval />);
  });

  it("renders the heading with the correct text", () => {
    expect(
      screen.getByRole("heading", { name: /Approval Pending/i })
    ).toBeInTheDocument();
  });

  it("renders the main message about account approval", () => {
    expect(
      screen.getByText(/Your account is pending approval from an administrator/i)
    ).toBeInTheDocument();
  });

  it("renders the follow-up note about notification", () => {
    expect(
      screen.getByText(/Please check back later. You’ll be notified once your account is activated/i)
    ).toBeInTheDocument();
  });
});