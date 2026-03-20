import { useEffect, useState } from 'react';

export default function TeamPage({ teams, onCreateTeam, onInvite, onSaveTeam, onSetSecurity }) {
  const [newGroupName, setNewGroupName] = useState('');
  const [groupPassword, setGroupPassword] = useState('');
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [draft, setDraft] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  useEffect(() => {
    if (!teams.length) return;
    if (!selectedGroupId || !teams.some((g) => g._id === selectedGroupId)) {
      setSelectedGroupId(teams[0]._id);
    }
  }, [teams]);

  useEffect(() => {
    const group = teams.find((x) => x._id === selectedGroupId);
    setDraft(group || null);
  }, [selectedGroupId, teams]);

  return (
    <section className="card modern split teams-ui">
      <div className="stack">
        <h2>Gruppen verwalten</h2>
        <input value={newGroupName} onChange={(e) => setNewGroupName(e.target.value)} placeholder="Neue Gruppe" />
        <input value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)} placeholder="Gruppenpasswort optional" />
        <button
          onClick={() => {
            if (!newGroupName.trim()) return;
            onCreateTeam(newGroupName, groupPassword);
            setNewGroupName('');
          }}
        >
          Gruppe erstellen
        </button>

        <div className="list">
          {teams.map((group) => (
            <button
              className={`item text-left ${selectedGroupId === group._id ? 'selected' : ''}`}
              key={group._id}
              onClick={() => setSelectedGroupId(group._id)}
            >
              <strong>{group.name}</strong>
              <p className="muted">{group.members?.length || 0} Mitglieder</p>
            </button>
          ))}
        </div>
      </div>

      <div className="editor stack">
        {!draft && <p className="muted">Wähle links eine Gruppe aus.</p>}
        {draft && (
          <>
            <h3>Gruppe bearbeiten</h3>
            <input value={draft.name || ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <button onClick={() => onSaveTeam(draft._id, draft.name)}>Name speichern</button>

            <h4>Sicherheit</h4>
            <input value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)} placeholder="Gruppenpasswort setzen/ändern" />
            <button onClick={() => onSetSecurity(draft._id, groupPassword)}>Passwort speichern</button>
            <p className="muted">Beim Einladen teilen wir das Gruppenpasswort verschlüsselt mit.</p>

            <h4>Mitglied einladen</h4>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="E-Mail" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
            <button onClick={() => inviteEmail && onInvite(draft._id, inviteEmail, inviteRole, groupPassword)}>Einladen</button>

            <ul>
              {(draft.members || []).map((m) => (
                <li key={m.user?._id || m.user}>{m.user?.email || 'unknown'} - {m.role}</li>
              ))}
            </ul>
          </>
        )}
      </div>
    </section>
  );
}
