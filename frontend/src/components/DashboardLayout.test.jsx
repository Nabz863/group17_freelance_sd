import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import DashboardLayout from "./DashboardLayout";

// Sample props
const menuItems = ["Home", "Settings"];
const contentMap = {
  Home: <p>Welcome to Home</p>,
  Settings: <p>Change your preferences</p>,
};

describe("DashboardLayout", () => {
  it("renders default role and shows initial content", () => {
    render(<DashboardLayout menuItems={menuItems} contentMap={contentMap} />);

    expect(screen.getByText("User")).toBeInTheDocument();
    expect(screen.getByText("Welcome to Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("changes content when sidebar button is clicked", () => {
    render(<DashboardLayout menuItems={menuItems} contentMap={contentMap} />);

    fireEvent.click(screen.getByText("Settings"));
    expect(screen.getByText("Change your preferences")).toBeInTheDocument();
  });

  it("toggles sidebar visibility when hamburger is clicked (checks class change)", () => {
    render(<DashboardLayout menuItems={menuItems} contentMap={contentMap} />);

    const sidebar = screen.getByLabelText("Sidebar");
    const toggleBtn = screen.getByLabelText("Toggle navigation menu");

    expect(sidebar.className).not.toContain("hidden");

    fireEvent.click(toggleBtn);
    expect(sidebar.className).toContain("hidden");

    fireEvent.click(toggleBtn);
    expect(sidebar.className).not.toContain("hidden");
  });

  it("shows fallback content when no matching section found", () => {
    render(<DashboardLayout menuItems={["Ghost"]} contentMap={{}} />);
    expect(screen.getByText("No content found.")).toBeInTheDocument();
  });

  it("renders nothing if menuItems is empty", () => {
    render(<DashboardLayout menuItems={[]} contentMap={{}} />);
    
    // Hamburger still renders even with no menu, so check specific absence
    expect(screen.queryByText("Home")).not.toBeInTheDocument();
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();
    expect(screen.getByText("No content found.")).toBeInTheDocument();
  });
});
