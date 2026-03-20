import { useState } from 'react';

export default function TeamPage({ teams, onCreateTeam, onInvite, onSetSecurity }) {
  const [teamName, setTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [ownerEncrypted, setOwnerEncrypted] = useState('');
  const [memberEncrypted, setMemberEncrypted] = useState('[]');

  return (
    <section className="card modern">
      <h2>Team Management</h2>
      <div className="stack">
        <input value={teamName} onChange={(e) => setTeamName(e.target.value)} placeholder="Teamname" />
        <button onClick={() => teamName && (onCreateTeam(teamName), setTeamName(''))}>Team erstellen</button>
      </div>

      <div className="stack mt">
        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          <option value="">Team auswählen</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>{t.name}</option>
          ))}
        </select>

        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Member E-Mail" />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
        <button onClick={() => selectedTeam && email && onInvite(selectedTeam, email, role)}>Mitglied hinzufügen</button>

        <input
          value={ownerEncrypted}
          onChange={(e) => setOwnerEncrypted(e.target.value)}
          placeholder="Owner-encrypted Team-PW Blob"
        />
        <textarea
          value={memberEncrypted}
          onChange={(e) => setMemberEncrypted(e.target.value)}
          placeholder='Member Keys JSON z.B. [{"user":"...","encryptedKey":"..."}]'
          rows={3}
        />
        <button
          onClick={() => {
            if (!selectedTeam) return;
            let parsed = [];
            try {
              parsed = JSON.parse(memberEncrypted);
            } catch {
              alert('Member JSON ist ungültig');
              return;
            }
            onSetSecurity(selectedTeam, ownerEncrypted, parsed);
          }}
        >
          Team Passwort-Schutz setzen
        </button>
      </div>

      <div className="list">
        {teams.map((team) => (
          <article className="item" key={team._id}>
            <strong>{team.name}</strong>
            <p className="muted">Security: {team.security?.enabled ? 'aktiv' : 'inaktiv'}</p>
            <ul>
              {(team.members || []).map((m) => (
                <li key={m.user?._id || m.user}>{m.user?.email || 'unbekannt'} — {m.role}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
