import "../styles/theme.css";

export default function ProfileFormLayout({ title, subtitle, children, onSubmit }) {
  return (
    <main className="profile-form-layout">
      <header>
        <h1 className="profile-form-title">{title}</h1>
        {subtitle && <p className="profile-form-subtitle">{subtitle}</p>}
      </header>

      <form className="profile-form" onSubmit={onSubmit}>
        {children}
      </form>
    </main>
  );
}