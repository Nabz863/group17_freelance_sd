import React from "react";
import { useAuth0 } from "@auth0/auth0-react";
import "./styles/Landing.css";

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
            Connect, collaborate, and get paid. A centralized platform for freelancers and clients to transform work relationships.
        </p>
        <button className="get-started-btn" onClick={handleClick}>
          Get Started
        </button>
      </section>

      <section className="features-carousel" aria-label="Platform Benefits">
        <article className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3 className="feature-title">Milestone Tracking</h3>
          <p className="feature-description">Track project progress, set milestones, and ensure smooth collaboration.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">🤝</div>
          <h3 className="feature-title">Secure Payments</h3>
          <p className="feature-description">Transparent payment system with milestones and escrow protection.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">💼</div>
          <h3 className="feature-title">Easy Job Posting</h3>
          <p className="feature-description">Clients can quickly post jobs with detailed requirements and expectations.</p>
        </article>
        <article className="feature-card">
          <div className="feature-icon">🚀</div>
          <h3 className="feature-title">Freelancer Profiles</h3>
          <p className="feature-description">Showcase your skills, portfolio, and professional history to potential clients.</p>
        </article>
      </section>

      <section className="stats-section">
        <div className="stat-item">
          <div className="stat-number"></div>
          <div className="stat-label"></div>
        </div>
        <div className="stat-item">
          <div className="stat-number"></div>
          <div className="stat-label"></div>
        </div>
        <div className="stat-item">
          <div className="stat-number"></div>
          <div className="stat-label"></div>
        </div>
      </section>
    </main>
  );
}
