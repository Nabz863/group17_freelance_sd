import { useAuth0 } from "@auth0/auth0-react";

export default function Home() {
  const { loginWithRedirect, logout, isAuthenticated, user } = useAuth0();

  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Welcome to the Freelancer Platform</h1>

      {isAuthenticated ? (
        <>
          <p>Hello, {user.name || user.email}!</p>
          <button
            onClick={() =>
              logout({ logoutParams: { returnTo: window.location.origin } })
            }
          >
            Log Out
          </button>
        </>
      ) : (
        <>
          <p>Please log in to access your dashboard.</p>
          <button onClick={() => loginWithRedirect()}>Log In / Sign Up</button>
        </>
      )}
    </div>
  );
}
