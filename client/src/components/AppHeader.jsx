export default function AppHeader({ page, setPage, onOpenCreate, queueCount, user }) {
  return (
    <header className="app-header glass">
      <div>
        <h1>Atelier Notes</h1>
        <p>{user?.username} · Queue {queueCount}</p>
      </div>
      <nav className="nav-tabs">
        <button className={page === 'workspace' ? 'active' : ''} onClick={() => setPage('workspace')}>Workspace</button>
        <button className={page === 'teams' ? 'active' : ''} onClick={() => setPage('teams')}>Teams</button>
        <button className={page === 'profile' ? 'active' : ''} onClick={() => setPage('profile')}>Profil</button>
      </nav>
      <button className="fab-small" onClick={onOpenCreate}>＋</button>
    </header>
  );
}
