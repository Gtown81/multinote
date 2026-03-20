import { useState } from 'react';

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const data = String(reader.result || '');
      resolve(data.split(',')[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NotePanel({ notes, teams, onCreate, onUpdate, onDelete, onDecrypt, onAttach }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [team, setTeam] = useState('');

  return (
    <section className="card">
      <h3>Notizen (Ende-zu-Ende verschlüsselt)</h3>
      <div className="stack">
        <input placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <textarea placeholder="Klartext (wird lokal verschlüsselt)" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />
        <select value={team} onChange={(e) => setTeam(e.target.value)}>
          <option value="">Privat (kein Team)</option>
          {teams.map((t) => (
            <option key={t._id} value={t._id}>
              {t.name}
            </option>
          ))}
        </select>
        <button
          onClick={() => {
            if (!title.trim()) return;
            onCreate({ title, plainText: content, shared: !!team, team: team || null });
            setTitle('');
            setContent('');
          }}
        >
          Verschlüsselt speichern
        </button>
      </div>

      <div className="list">
        {notes.map((note) => (
          <article key={note._id} className="item">
            <div className="row between">
              <strong>{note.title}</strong>
              <button className="danger" onClick={() => onDelete(note._id)}>
                Löschen
              </button>
            </div>
            <p className="muted">Cipher: {note.encryptedContent?.cipherText?.slice(0, 26)}...</p>
            <div className="row">
              <button onClick={() => onDecrypt(note)}>Entschlüsseln</button>
              <label className="file-upload">
                Anhang
                <input
                  type="file"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const dataBase64 = await fileToBase64(file);
                    onAttach(note._id, {
                      name: file.name,
                      mimeType: file.type || 'application/octet-stream',
                      size: file.size,
                      dataBase64
                    });
                  }}
                />
              </label>
            </div>
            {note.decryptedPreview && <p>{note.decryptedPreview}</p>}
            <details>
              <summary>Anhänge ({note.attachments?.length || 0})</summary>
              <ul>
                {(note.attachments || []).map((a) => (
                  <li key={a._id}>{a.name} ({Math.round(a.size / 1024)} KB)</li>
                ))}
              </ul>
            </details>
          </article>
        ))}
      </div>
    </section>
  );
}
