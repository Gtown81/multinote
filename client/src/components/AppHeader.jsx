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
        <button className={`icon-tab ${page === 'workspace' ? 'active' : ''}`} onClick={() => setPage('workspace')} title="Workspace" aria-label="Workspace">🗂️</button>
        <button className={`icon-tab ${page === 'teams' ? 'active' : ''}`} onClick={() => setPage('teams')} title="Gruppen" aria-label="Gruppen">👥</button>
        <button className={`icon-tab ${page === 'profile' ? 'active' : ''}`} onClick={() => setPage('profile')} title="Profil" aria-label="Profil">👤</button>
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
