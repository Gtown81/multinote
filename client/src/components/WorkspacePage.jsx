import { useEffect, useMemo, useState } from 'react';

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
  const [search, setSearch] = useState('');

  const items = useMemo(() => {
    const base = tab === 'notes' ? notes : tab === 'tasks' ? tasks : todos;
    const q = search.trim().toLowerCase();
    if (!q) return base;
    return base.filter((x) =>
      [x.title, x.publicInfo, x.description, x.details, x.category, x.project, ...(x.tags || [])]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(q)
    );
  }, [tab, notes, tasks, todos, search]);

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
        <input className="search" placeholder="Suche über Notes/Tasks/Todos, Tags, Kategorie, Projekt..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="segmented">
          <button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}>Notes</button>
          <button className={tab === 'tasks' ? 'active' : ''} onClick={() => setTab('tasks')}>Tasks</button>
          <button className={tab === 'todos' ? 'active' : ''} onClick={() => setTab('todos')}>Todos</button>
        </div>

        <div className="list">
          {items.map((item) => (
            <button key={item._id} className={`item text-left ${selectedId === item._id ? 'selected' : ''}`} onClick={() => setSelectedId(item._id)}>
              <strong>{item.title}</strong>
              {tab === 'notes' && <p className="muted">{item.publicInfo || 'keine öffentliche Info'} · {(item.encryptedContent?.cipherText ? '****' : '')}</p>}
              {tab !== 'notes' && <p className="muted">{item.category || '-'} · {item.project || '-'}</p>}
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
            <input value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Kategorie" />
            <input value={draft.project || ''} onChange={(e) => setDraft((d) => ({ ...d, project: e.target.value }))} placeholder="Projekt" />
            <input value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="Tags (kommagetrennt)" />
            <textarea
              value={typeof draft.decryptedPreview === 'string' ? draft.decryptedPreview : '****'}
              onChange={(e) => setDraft((d) => ({ ...d, decryptedPreview: e.target.value }))}
              rows={6}
              readOnly={typeof draft.decryptedPreview !== 'string'}
              placeholder="Verschlüsselter Inhalt"
            />
            <div className="row">
              <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team, shared: !!team }))} />
              {typeof draft.decryptedPreview === 'string' ? (
                <button title="Wieder verschlüsselt anzeigen" onClick={() => setDraft((d) => ({ ...d, decryptedPreview: undefined }))}>🙈</button>
              ) : (
                <button title="Entschlüsseln" onClick={() => onDecrypt(current)}>🔓</button>
              )}
              <button title="Speichern" disabled={typeof draft.decryptedPreview !== 'string'} onClick={() => onSaveNote(draft)}>💾</button>
            </div>
          </div>
        )}

        {current && tab === 'tasks' && (
          <div className="stack">
            <h3>Task bearbeiten</h3>
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <input value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Kategorie" />
            <input value={draft.project || ''} onChange={(e) => setDraft((d) => ({ ...d, project: e.target.value }))} placeholder="Projekt" />
            <input value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="Tags (kommagetrennt)" />
            <textarea value={draft.description || ''} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={5} />
            <label><input type="checkbox" checked={!!draft.completed} onChange={(e) => setDraft((d) => ({ ...d, completed: e.target.checked }))} /> erledigt</label>
            <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team }))} />
            <button title="Speichern" onClick={() => onSaveTask(draft)}>💾</button>
          </div>
        )}

        {current && tab === 'todos' && (
          <div className="stack">
            <h3>Todo bearbeiten</h3>
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <input value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Kategorie" />
            <input value={draft.project || ''} onChange={(e) => setDraft((d) => ({ ...d, project: e.target.value }))} placeholder="Projekt" />
            <input value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="Tags (kommagetrennt)" />
            <textarea value={draft.details || ''} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} rows={5} />
            <label><input type="checkbox" checked={!!draft.done} onChange={(e) => setDraft((d) => ({ ...d, done: e.target.checked }))} /> done</label>
            <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team }))} />
            <button title="Speichern" onClick={() => onSaveTodo(draft)}>💾</button>
          </div>
        )}
      </div>
    </section>
  );
}
