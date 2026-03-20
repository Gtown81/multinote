import { useState } from 'react';

export default function TeamPanel({ teams, onCreateTeam, onInvite }) {
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('viewer');
  const [selectedTeam, setSelectedTeam] = useState('');

  return (
    <section className="card">
      <h3>Teams & Rollen</h3>
      <div className="stack">
        <input placeholder="Neues Team" value={teamName} onChange={(e) => setTeamName(e.target.value)} />
        <button
          onClick={() => {
            if (!teamName.trim()) return;
            onCreateTeam(teamName);
            setTeamName('');
          }}
        >
          Team erstellen
        </button>
      </div>

      <hr />
      <div className="stack">
        <select value={selectedTeam} onChange={(e) => setSelectedTeam(e.target.value)}>
          <option value="">Team wählen</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <input placeholder="Mitglied E-Mail" value={email} onChange={(e) => setEmail(e.target.value)} />
        <select value={role} onChange={(e) => setRole(e.target.value)}>
          <option value="viewer">Viewer</option>
          <option value="editor">Editor</option>
          <option value="owner">Owner</option>
        </select>
        <button
          onClick={() => {
            if (!selectedTeam || !email) return;
            onInvite(selectedTeam, email, role);
            setEmail('');
          }}
        >
          Mitglied einladen
        </button>
      </div>

      <div className="list">
        {teams.map((team) => (
          <article className="item" key={team._id}>
            <strong>{team.name}</strong>
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
