import "../styles/theme.css";

export default function VerifyEmail() {
  return (
    <main className="landing-container">
      <section className="hero-section">
        <h1 className="hero-title">Verify Your Email</h1>
        <p className="hero-subtitle">
          We've sent a verification link to your email. Please check your inbox and click the link to continue.
        </p>
        <p className="hero-subtitle" style={{ animationDelay: "0.4s" }}>
          After verifying, refresh this page or log in again to proceed.
        </p>
      </section>
    </main>
  );
}