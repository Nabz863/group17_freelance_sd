import React from "react";
import { render, screen } from "@testing-library/react";
import VerifyEmail from "./VerifyEmail";

describe("VerifyEmail", () => {
  it("renders the email verification page with correct content", () => {
    render(<VerifyEmail />);
    
    // Check for heading
    expect(screen.getByRole("heading", { name: /Verify Your Email/i })).toBeInTheDocument();
    
    // Check for main message
    expect(screen.getByText(/We've sent a verification link to your email/i)).toBeInTheDocument();
    expect(screen.getByText(/Please check your inbox and click the link to continue/i)).toBeInTheDocument();
    
    // Check for follow-up instruction
    expect(screen.getByText(/After verifying, refresh this page or log in again to proceed/i)).toBeInTheDocument();
  });

  it("applies the correct container classes", () => {
    render(<VerifyEmail />);
    
    // Check main container class
    const mainElement = screen.getByRole("main");
    expect(mainElement).toHaveClass("landing-container");
    
    // Check section class
    const sectionElement = mainElement.firstChild;
    expect(sectionElement).toHaveClass("hero-section");
  });

  it("applies the correct typography classes", () => {
    render(<VerifyEmail />);
    
    // Check heading class
    const heading = screen.getByRole("heading");
    expect(heading).toHaveClass("hero-title");
    
    // Check paragraph classes
    const paragraphs = screen.getAllByText(/./i);
    expect(paragraphs[1]).toHaveClass("hero-subtitle");
    expect(paragraphs[2]).toHaveClass("hero-subtitle");
  });

  it("applies animation delay to the second paragraph", () => {
    render(<VerifyEmail />);
    
    const paragraphs = screen.getAllByText(/./i);
    expect(paragraphs[2]).toHaveStyle({ animationDelay: "0.4s" });
  });
});