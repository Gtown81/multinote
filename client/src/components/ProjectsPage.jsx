import { useState } from 'react';

export default function ProjectsPage({ projects, activeProjectId, setActiveProjectId, onCreateProject }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  return (
    <section className="card modern split">
      <div className="stack">
        <h2>Projekte</h2>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Projektname" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibung" rows={3} />
        <button onClick={() => name.trim() && (onCreateProject(name, description), setName(''), setDescription(''))}>Projekt anlegen</button>
      </div>
      <div className="stack">
        <h3>Untertabs / Filter</h3>
        <div className="row">
          <button className={!activeProjectId ? 'active' : ''} onClick={() => setActiveProjectId('')}>Alle</button>
          {projects.map((p) => (
            <button key={p._id} className={activeProjectId === p._id ? 'active' : ''} onClick={() => setActiveProjectId(p._id)}>{p.name}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
