import { useState } from 'react';

export default function ArtistsPage({ artists, activeArtistId, setActiveArtistId, onCreateArtist }) {
  const [name, setName] = useState('');
  const [profile, setProfile] = useState('');

  const create = () => {
    if (!name.trim()) return;
    onCreateArtist(name, profile);
    setName('');
    setProfile('');
  };

  return (
    <section className="card modern split">
      <div className="stack">
        <div className="row"><h2>Strategie</h2><button title="Neue Strategie" onClick={create}>＋</button></div>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Strategie-Name" />
        <textarea value={profile} onChange={(e) => setProfile(e.target.value)} placeholder="Profil" rows={3} />
        <button onClick={create}>Strategie anlegen</button>
      </div>
      <div className="stack">
        <h3>Untertabs / Filter</h3>
        <div className="row">
          <button className={!activeArtistId ? 'active' : ''} onClick={() => setActiveArtistId('')}>Alle</button>
          {artists.map((a) => (
            <button key={a._id} className={activeArtistId === a._id ? 'active' : ''} onClick={() => setActiveArtistId(a._id)}>{a.name}</button>
          ))}
        </div>
      </div>
    </section>
  );
}
