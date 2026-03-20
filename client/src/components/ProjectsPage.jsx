import { useState } from 'react';

export default function ProjectsPage({ projects, activeProjectId, setActiveProjectId, onCreateProject }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const create = () => {
    if (!name.trim()) return;
    onCreateProject(name, description);
    setName('');
    setDescription('');
  };

  return (
    <section className="card modern split">
      <div className="stack">
        <div className="row"><h2>Projekte</h2><button title="Neues Projekt" onClick={create}>＋</button></div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Projektname" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Beschreibung" rows={3} />
        <button onClick={create}>Projekt anlegen</button>
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
