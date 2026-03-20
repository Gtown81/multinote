import { useState } from 'react';

export default function NotePanel({ notes, onCreate, onUpdate, onDelete }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  return (
    <section className="card">
      <h3>Notizen</h3>
      <div className="row">
        <input placeholder="Titel" value={title} onChange={(e) => setTitle(e.target.value)} />
        <button
          onClick={() => {
            if (!title.trim()) return;
            onCreate({ title, content, shared: false });
            setTitle('');
            setContent('');
          }}
        >
          Neu
        </button>
      </div>
      <textarea placeholder="Inhalt" value={content} onChange={(e) => setContent(e.target.value)} rows={3} />

      <div className="list">
        {notes.map((note) => (
          <article key={note._id} className="item">
            <input
              value={note.title}
              onChange={(e) => onUpdate(note._id, { title: e.target.value })}
              className="item-title"
            />
            <textarea
              value={note.content || ''}
              onChange={(e) => onUpdate(note._id, { content: e.target.value })}
              rows={2}
            />
            <div className="row between">
              <label>
                <input
                  type="checkbox"
                  checked={!!note.shared}
                  onChange={(e) => onUpdate(note._id, { shared: e.target.checked })}
                />{' '}
                Shared
              </label>
              <button className="danger" onClick={() => onDelete(note._id)}>
                Löschen
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
