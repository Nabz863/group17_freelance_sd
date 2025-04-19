import React, { useEffect } from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./styles/Landing.css";

export default function Landing() {
  const { isAuthenticated, isLoading } = useAuth0();

  // 🛑 Don't render the landing page if authenticated — let App.js handle redirection
  if (isLoading || isAuthenticated) return null;

  return (
    <main className="landing-page">
      {/* Left: Sliding Info Cards */}
      <section className="intro-section" aria-label="App Highlights">
        <section className="carousel-container">
          <section className="carousel-track">
            <article className="slide" role="note">🎯 Project Focused</article>
            <article className="slide" role="note">🤝 Built on Trust</article>
            <article className="slide" role="note">💼 Freelancer-Ready</article>
            <article className="slide" role="note">🚀 Scale Fast</article>
          </section>
        </section>
      </section>

      {/* Right: Login Call-to-Action */}
      <section className="login-panel" aria-label="Call to Action">
        <header>
          <h1 className="logo">The Gig Is Up</h1>
        </header>
        <p className="tagline">Manage freelancers, projects, and payments in one place.</p>
        <nav aria-label="Primary">
          <button
            className="btn-get-started"
            onClick={() => window.location.assign("/")} // This will trigger Auth0
            aria-label="Begin signup or login"
          >
            Get Started
          </button>
        </nav>
      </section>
    </main>
  );
}

