import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "../styles/Landing.css";

export default function Landing() {
  const { loginWithRedirect } = useAuth0();

  const handleClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    e.target.style.setProperty("--click-x", `${x}px`);
    e.target.style.setProperty("--click-y", `${y}px`);
    e.target.classList.add("clicked");
    setTimeout(() => e.target.classList.remove("clicked"), 600);
    loginWithRedirect();
  };

  return (
    <main className="landing-container">
      <section className="hero-section">
        <h1 className="hero-title">The Gig Is Up</h1>
        <p className="hero-subtitle">
          Manage freelancers, projects, and payments in one powerful platform.
        </p>
        <button className="get-started-btn" onClick={handleClick}>
          Get Started
        </button>
      </section>

      <section className="features-carousel" aria-label="Platform Benefits">
        <article className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Project Focused</h3>
          <p className="feature-description">Track progress from start to finish.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3 className="feature-title">Trust Driven</h3>
          <p className="feature-description">Profiles and approvals ensure quality.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">💼</div>
          <h3 className="feature-title">Freelancer Ready</h3>
          <p className="feature-description">Easily apply, get hired, and get paid.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3 className="feature-title">Scalable</h3>
          <p className="feature-description">Built for growth and rapid onboarding.</p>
        </article>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number">500+</div>
          <div className="stat-label">Freelancers Onboarded</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">200+</div>
          <div className="stat-label">Successful Projects</div>
        </div>
        <div className="stat-item">
          <div className="stat-number">50+</div>
          <div className="stat-label">Trusted Clients</div>
        </div>
      </section>
    </main>
  );
}
