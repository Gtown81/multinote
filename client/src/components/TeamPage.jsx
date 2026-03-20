import { useEffect, useState } from 'react';

export default function TeamPage({ teams, onCreateTeam, onInvite, onSaveTeam, onSetSecurity }) {
  const [teamName, setTeamName] = useState('');
  const [groupPassword, setGroupPassword] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [draft, setDraft] = useState(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('viewer');

  useEffect(() => {
    if (!teams.length) return;
    if (!selectedTeamId) setSelectedTeamId(teams[0]._id);
  }, [teams]);

  useEffect(() => {
    const t = teams.find((x) => x._id === selectedTeamId);
    setDraft(t || null);
  }, [selectedTeamId, teams]);

  return (
    <section className="card modern split">
      <div className="stack">
        <h2>Teams</h2>
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Neues Team" />
        <input value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)} placeholder="Gruppenpasswort (optional)" />
        <button
          onClick={() => {
            if (!teamName.trim()) return;
            onCreateTeam(teamName, groupPassword);
            setTeamName('');
            setGroupPassword('');
          }}
        >
          Team erstellen
        </button>

        <div className="list">
          {teams.map((team) => (
            <button className={`item text-left ${selectedTeamId === team._id ? 'selected' : ''}`} key={team._id} onClick={() => setSelectedTeamId(team._id)}>
              <strong>{team.name}</strong>
              <p className="muted">{team.members?.length || 0} Mitglieder</p>
            </button>
          ))}
        </div>
      </div>

      <div className="editor stack">
        {!draft && <p className="muted">Wähle ein Team.</p>}
        {draft && (
          <>
            <h3>Team öffnen & bearbeiten</h3>
            <input value={draft.name || ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <button onClick={() => onSaveTeam(draft._id, draft.name)}>Name speichern</button>

            <h4>Gruppenpasswort setzen/ändern</h4>
            <input value={groupPassword} onChange={(e) => setGroupPassword(e.target.value)} placeholder="Neues Gruppenpasswort" />
            <button onClick={() => onSetSecurity(draft._id, groupPassword)}>Gruppenpasswort speichern</button>
            <p className="muted">Beim Einladen wird das Gruppenpasswort automatisch verschlüsselt für das Mitglied geteilt.</p>

            <h4>Mitglied einladen</h4>
            <input value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} placeholder="E-Mail" />
            <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}>
              <option value="viewer">Viewer</option>
              <option value="editor">Editor</option>
              <option value="owner">Owner</option>
            </select>
            <button
              onClick={() => {
                if (!inviteEmail) return;
                onInvite(draft._id, inviteEmail, inviteRole, groupPassword);
                setInviteEmail('');
              }}
            >
              Einladen
            </button>

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
