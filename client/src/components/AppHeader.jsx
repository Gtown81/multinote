export default function AppHeader({
  page,
  setPage,
  onOpenCreate,
  queueCount,
  user,
  cryptoPassword,
  setCryptoPassword,
  rememberCrypto,
  setRememberCrypto,
  autoDecryptAll,
  setAutoDecryptAll
}) {
  return (
    <header className="app-header glass">
      <div>
        <h1>Atelier Notes</h1>
        <p>{user?.username} · Queue {queueCount}</p>
      </div>

      <nav className="nav-tabs">
        <button className={page === 'workspace' ? 'active' : ''} onClick={() => setPage('workspace')}>Workspace</button>
        <button className={page === 'teams' ? 'active' : ''} onClick={() => setPage('teams')}>Gruppen</button>
        <button className={page === 'projects' ? 'active' : ''} onClick={() => setPage('projects')}>Projekte</button>
        <button className={page === 'artists' ? 'active' : ''} onClick={() => setPage('artists')}>Strategie</button>
        <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profil</button>
      </nav>

      <div className="crypto-box">
        <input
          type="password"
          placeholder="E2E Passwort"
          value={cryptoPassword}
          onChange={(e) => setCryptoPassword(e.target.value)}
        />
        <div className="toggle-row">
          <label className="remember compact">
            <input
              type="checkbox"
              checked={rememberCrypto}
              onChange={(e) => setRememberCrypto(e.target.checked)}
            />
            Speichern
          </label>
          <label className="remember compact">
            <input type="checkbox" checked={autoDecryptAll} onChange={(e) => setAutoDecryptAll(e.target.checked)} />
            Auto
          </label>
          <button className="fab-small" onClick={onOpenCreate}>＋</button>
        </div>
      </div>
    </header>
  );
}
