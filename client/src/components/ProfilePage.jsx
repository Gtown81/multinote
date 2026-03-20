export default function ProfilePage({ user, cryptoPassword, setCryptoPassword, onEnablePush, onLogout }) {
  return (
    <section className="card modern">
      <h2>Profil</h2>
      <p><strong>Username:</strong> {user?.username}</p>
      <p><strong>E-Mail:</strong> {user?.email}</p>
      <div className="stack">
        <input
          type="password"
          placeholder="E2E Passwort (nur lokal)"
          value={cryptoPassword}
          onChange={(e) => setCryptoPassword(e.target.value)}
        />
        <button onClick={onEnablePush}>Push aktivieren</button>
        <button className="danger" onClick={onLogout}>Logout</button>
      </div>
    </section>
  );
}
