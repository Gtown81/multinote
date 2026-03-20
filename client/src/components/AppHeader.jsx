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
        <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profil</button>
      </nav>

      <div className="crypto-box">
        <input
          type="password"
          placeholder="E2E Passwort"
          value={cryptoPassword}
          onChange={(e) => setCryptoPassword(e.target.value)}
        />
        <label className="remember">
          <input
            type="checkbox"
            checked={rememberCrypto}
            onChange={(e) => setRememberCrypto(e.target.checked)}
          />
          Im Browser speichern
        </label>
        <label className="remember">
          <input type="checkbox" checked={autoDecryptAll} onChange={(e) => setAutoDecryptAll(e.target.checked)} />
          Alle auto entschlüsseln
        </label>
      </div>

      <button className="fab-small" onClick={onOpenCreate}>＋</button>
    </header>
  );
}
