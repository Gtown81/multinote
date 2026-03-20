function TeamSelect({ teams, value, onChange }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Kein Team</option>
      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
    </select>
  );
}

export default function WorkspacePage({ tab, setTab, notes, tasks, todos, teams, onDecrypt, onUpdateNote, onUpdateTask, onUpdateTodo }) {
  return (
    <section className="card modern">
      <div className="segmented">
        <button className={tab === 'notes' ? 'active' : ''} onClick={() => setTab('notes')}>Notes</button>
        <button className={tab === 'tasks' ? 'active' : ''} onClick={() => setTab('tasks')}>Tasks</button>
        <button className={tab === 'todos' ? 'active' : ''} onClick={() => setTab('todos')}>Todos</button>
      </div>

      {tab === 'notes' && (
        <div className="list">
          {notes.map((n) => (
            <article key={n._id} className="item">
              <h4>{n.title}</h4>
              <p className="muted">Public: {n.publicInfo || '—'}</p>
              <div className="row">
                <TeamSelect teams={teams} value={n.team} onChange={(team) => onUpdateNote(n._id, { team, shared: !!team })} />
                <button onClick={() => onDecrypt(n)}>Entschlüsseln</button>
              </div>
              {n.decryptedPreview && <p>{n.decryptedPreview}</p>}
            </article>
          ))}
        </div>
      )}

      {tab === 'tasks' && (
        <div className="list">
          {tasks.map((t) => (
            <article key={t._id} className="item">
              <h4>{t.title}</h4>
              <textarea value={t.description || ''} onChange={(e) => onUpdateTask(t._id, { description: e.target.value })} rows={2} />
              <label><input type="checkbox" checked={t.completed} onChange={(e) => onUpdateTask(t._id, { completed: e.target.checked })} /> erledigt</label>
              <TeamSelect teams={teams} value={t.team} onChange={(team) => onUpdateTask(t._id, { team })} />
            </article>
          ))}
        </div>
      )}

      {tab === 'todos' && (
        <div className="list">
          {todos.map((t) => (
            <article key={t._id} className="item">
              <h4>{t.title}</h4>
              <textarea value={t.details || ''} onChange={(e) => onUpdateTodo(t._id, { details: e.target.value })} rows={2} />
              <label><input type="checkbox" checked={t.done} onChange={(e) => onUpdateTodo(t._id, { done: e.target.checked })} /> done</label>
              <TeamSelect teams={teams} value={t.team} onChange={(team) => onUpdateTodo(t._id, { team })} />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
