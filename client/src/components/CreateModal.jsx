import { useMemo } from 'react';

export default function CreateModal({ open, mode, setMode, form, setForm, teams, projects, artists, onClose, onSubmit }) {
  const title = useMemo(() => ({ note: 'Neue Notiz', task: 'Neue Task', todo: 'Neues Todo', project: 'Neues Projekt', artist: 'Neue Strategie' }[mode]), [mode]);
  if (!open) return null;

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal card modern" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <div className="segmented">
          <button className={mode === 'note' ? 'active' : ''} onClick={() => setMode('note')}>Note</button>
          <button className={mode === 'task' ? 'active' : ''} onClick={() => setMode('task')}>Task</button>
          <button className={mode === 'todo' ? 'active' : ''} onClick={() => setMode('todo')}>Todo</button>
          <button className={mode === 'project' ? 'active' : ''} onClick={() => setMode('project')}>Projekt</button>
          <button className={mode === 'artist' ? 'active' : ''} onClick={() => setMode('artist')}>Strategie</button>
        </div>

        <div className="stack">
          <input value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} placeholder="Titel" />
          {mode === 'note' && <input value={form.publicInfo} onChange={(e) => setForm((p) => ({ ...p, publicInfo: e.target.value }))} placeholder="Öffentliche Info (immer sichtbar)" />}
          <textarea value={form.body} onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))} placeholder="Inhalt/Details" rows={4} />
          {(mode === 'note' || mode === 'task' || mode === 'todo') && <input value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} placeholder="Kategorien (kommagetrennt)" />}
          {(mode === 'note' || mode === 'task' || mode === 'todo') && <select value={form.projectId || ""} onChange={(e) => setForm((p) => ({ ...p, projectId: e.target.value }))}>
            <option value="">Projekt wählen</option>
            {projects.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
          </select>}
          {(mode === 'note' || mode === 'task' || mode === 'todo') && <select value={form.artistId || ""} onChange={(e) => setForm((p) => ({ ...p, artistId: e.target.value }))}>
            <option value="">Strategie wählen</option>
            {artists.map((a) => <option key={a._id} value={a._id}>{a.name}</option>)}
          </select>}
          {(mode === 'note' || mode === 'task' || mode === 'todo') && <input value={form.tags} onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))} placeholder="Tags (kommagetrennt, mehrere möglich)" />}
          {(mode === 'note' || mode === 'task' || mode === 'todo') && <select value={form.team} onChange={(e) => setForm((p) => ({ ...p, team: e.target.value }))}>
            <option value="">Kein Team</option>
            {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
          </select>}
          {mode === 'note' && (
            <input type="file" onChange={(e) => setForm((p) => ({ ...p, file: e.target.files?.[0] || null }))} />
          )}
          <button onClick={onSubmit}>Speichern</button>
        </div>
      </div>
    </div>
  );
}
