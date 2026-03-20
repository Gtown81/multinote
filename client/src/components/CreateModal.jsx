import { useMemo } from 'react';

export default function CreateModal({ open, mode, setMode, form, setForm, teams, onClose, onSubmit }) {
  const title = useMemo(() => ({ note: 'Neue Notiz', task: 'Neue Task', todo: 'Neues Todo' }[mode]), [mode]);
  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal card modern" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="segmented">
          <button className={mode === 'note' ? 'active' : ''} onClick={() => setMode('note')}>Note</button>
          <button className={mode === 'task' ? 'active' : ''} onClick={() => setMode('task')}>Task</button>
          <button className={mode === 'todo' ? 'active' : ''} onClick={() => setMode('todo')}>Todo</button>
        </div>

        <div className="stack">
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Titel" />
          <input value={form.publicInfo} onChange={(e) => setForm((p) => ({ ...p, publicInfo: e.target.value }))} placeholder="Öffentliche Info (immer sichtbar)" />
          <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Inhalt/Details" rows={4} />
          <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Kategorie" />
          <input value={form.project} onChange={(e) => setForm((p) => ({ ...p, project: e.target.value }))} placeholder="Projekt" />
          <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (kommagetrennt)" />
          <select value={form.team} onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}>
            <option value="">Kein Team</option>
            {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>
          {mode === 'note' && (
            <input type="file" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
          )}
          <button onClick={onSubmit}>Speichern</button>
        </div>
      </div>
    </div>
  );
}
