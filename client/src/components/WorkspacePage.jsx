import { useEffect, useState } from 'react';

function TeamSelect({ teams, value, onChange }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Kein Team</option>
      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
    </select>
  );
}

export default function WorkspacePage({ tab, setTab, notes, tasks, todos, teams, onDecrypt, onSaveNote, onSaveTask, onSaveTodo }) {
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState({});

  const items = tab === 'notes' ? notes : tab === 'tasks' ? tasks : todos;

  useEffect(() => {
    if (!items.length) {
      setSelectedId('');
      setDraft({});
      return;
    }
    const first = items[0];
    if (!selectedId || !items.some((i) => i._id === selectedId)) {
      setSelectedId(first._id);
    }
  }, [tab, items]);

  useEffect(() => {
    const item = items.find((i) => i._id === selectedId);
    if (!item) return;
    setDraft(item);
  }, [selectedId, items]);

  const current = items.find((i) => i._id === selectedId);

  return (
    <section className="card modern split">
      <div>
        <div className="segmented">
          <button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}>Notes</button>
          <button className={tab === 'tasks' ? 'active' : ''} onClick={() => setTab('tasks')}>Tasks</button>
          <button className={tab === 'todos' ? 'active' : ''} onClick={() => setTab('todos')}>Todos</button>
        </div>

        <div className="list">
          {items.map((item) => (
            <button key={item._id} className={`item text-left ${selectedId === item._id ? 'selected' : ''}`} onClick={() => setSelectedId(item._id)}>
              <strong>{item.title}</strong>
              {tab === 'notes' && <p className="muted">{item.publicInfo || 'keine öffentliche Info'}</p>}
            </button>
          ))}
        </div>
      </div>

      <div className="editor">
        {!current && <p className="muted">Kein Eintrag vorhanden.</p>}

        {current && tab === 'notes' && (
          <div className="stack">
            <h3>Notiz bearbeiten</h3>
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} placeholder="Titel" />
            <input value={draft.publicInfo || ''} onChange={(e) => setDraft((d) => ({ ...d, publicInfo: e.target.value }))} placeholder="Öffentliche Info" />
            <textarea value={draft.decryptedPreview || ''} onChange={(e) => setDraft((d) => ({ ...d, decryptedPreview: e.target.value }))} rows={6} placeholder="Verschlüsselter Inhalt (nach Entschlüsseln bearbeitbar)" />
            {typeof draft.decryptedPreview !== 'string' && <p className="muted">Zum Speichern zuerst auf "Öffnen" klicken (entschlüsseln).</p>}
            <div className="row">
              <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team, shared: !!team }))} />
              <button onClick={() => onDecrypt(current)}>Öffnen</button>
              <button disabled={typeof draft.decryptedPreview !== 'string'} onClick={() => onSaveNote(draft)}>Speichern</button>
            </div>
          </div>
        )}

        {current && tab === 'tasks' && (
          <div className="stack">
            <h3>Task bearbeiten</h3>
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <textarea value={draft.description || ''} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={5} />
            <label><input type="checkbox" checked={!!draft.completed} onChange={(e) => setDraft((d) => ({ ...d, completed: e.target.checked }))} /> erledigt</label>
            <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team }))} />
            <button onClick={() => onSaveTask(draft)}>Speichern</button>
          </div>
        )}

        {current && tab === 'todos' && (
          <div className="stack">
            <h3>Todo bearbeiten</h3>
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <textarea value={draft.details || ''} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} rows={5} />
            <label><input type="checkbox" checked={!!draft.done} onChange={(e) => setDraft((d) => ({ ...d, done: e.target.checked }))} /> done</label>
            <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team }))} />
            <button onClick={() => onSaveTodo(draft)}>Speichern</button>
          </div>
        )}
      </div>
    </section>
  );
}
