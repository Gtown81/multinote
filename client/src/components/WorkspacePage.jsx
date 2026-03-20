import { useEffect, useMemo, useState } from 'react';

const STATUS_OPTIONS = ['open', 'in_progress', 'review', 'done', 'blocked'];
const TOP_TABS = ['notes', 'tasks', 'todos', 'projects', 'artists'];
const TAB_ICONS = { notes: '📝', tasks: '✅', todos: '📌', projects: '📁', artists: '🎯' };
const TAB_LABELS = { notes: 'Notes', tasks: 'Tasks', todos: 'Todos', projects: 'Projekte', artists: 'Strategie' };

function TeamSelect({ teams, value, onChange }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">Kein Team</option>
      {teams.map((t) => <option key={t._id} value={t._id}>{t.name}</option>)}
    </select>
  );
}

function RefSelect({ items, value, onChange, label }) {
  return (
    <select value={value || ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">{label}</option>
      {items.map((i) => <option key={i._id} value={i._id}>{i.name}</option>)}
    </select>
  );
}

export default function WorkspacePage({ tab, setTab, notes, tasks, todos, projects, artists, teams, activeProjectId, activeArtistId, setActiveProjectId, setActiveArtistId, onDecrypt, onSaveNote, onSaveTask, onSaveTodo, onSaveProject, onSaveArtist, onOpenCreateForTab }) {
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState({});
  const [search, setSearch] = useState('');
  const [metaExpanded, setMetaExpanded] = useState(false);

  const base = tab === 'notes' ? notes : tab === 'tasks' ? tasks : tab === 'todos' ? todos : tab === 'projects' ? projects : artists;

  const items = useMemo(() => {
    const q = search.trim().toLowerCase();
    return base.filter((x) => {
      const matchSearch = !q || [x.name, x.title, x.publicInfo, x.description, x.details, x.profile, ...(x.tags || [])].filter(Boolean).join(' ').toLowerCase().includes(q);
      if (tab === 'notes' || tab === 'tasks' || tab === 'todos') {
        const matchProject = !activeProjectId || x.projectId?._id === activeProjectId || x.projectId === activeProjectId;
        const matchArtist = !activeArtistId || x.artistId?._id === activeArtistId || x.artistId === activeArtistId;
        return matchSearch && matchProject && matchArtist;
      }
      return matchSearch;
    });
  }, [base, search, tab, activeProjectId, activeArtistId]);

  useEffect(() => {
    if (!items.length) {
      setSelectedId('');
      setDraft({});
      return;
    }
    if (!selectedId || !items.some((i) => i._id === selectedId)) setSelectedId(items[0]._id);
  }, [tab, items]);

  useEffect(() => {
    const item = items.find((i) => i._id === selectedId);
    if (item) setDraft(item);
  }, [selectedId, items]);

  useEffect(() => {
    setMetaExpanded(false);
  }, [tab, selectedId]);

  const current = items.find((i) => i._id === selectedId);
  const getRefId = (value) => (value && typeof value === 'object' ? value._id : value);
  const getRefName = (value, source) => {
    if (!value) return '';
    if (typeof value === 'object' && value.name) return value.name;
    const id = getRefId(value);
    return source.find((x) => x._id === id)?.name || '';
  };

  return (
    <section className="card modern split">
      <div>
        <input className="search" placeholder="Suche..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <div className="segmented">
          {TOP_TABS.map((t) => (
            <button key={t} className={`icon-tab ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)} title={TAB_LABELS[t]} aria-label={TAB_LABELS[t]}>
              {TAB_ICONS[t]}
            </button>
          ))}
          <button title="Neu im aktuellen Tab" onClick={() => onOpenCreateForTab(tab)}>＋</button>
        </div>

        {(tab === 'notes' || tab === 'tasks' || tab === 'todos') && (
          <div className="subtabs">
            <span>Projekt:</span>
            <button className={!activeProjectId ? 'active' : ''} onClick={() => setActiveProjectId('')}>Alle</button>
            {projects.map((p) => <button key={p._id} className={activeProjectId === p._id ? 'active' : ''} onClick={() => setActiveProjectId(p._id)}>{p.name}</button>)}
            <span>Strategie:</span>
            <button className={!activeArtistId ? 'active' : ''} onClick={() => setActiveArtistId('')}>Alle</button>
            {artists.map((a) => <button key={a._id} className={activeArtistId === a._id ? 'active' : ''} onClick={() => setActiveArtistId(a._id)}>{a.name}</button>)}
          </div>
        )}

        {(tab === 'projects' || tab === 'artists') && (
          <div className="subtabs">
            <button className={!selectedId ? 'active' : ''} onClick={() => setSelectedId('')}>Alle</button>
            {items.map((x) => <button key={x._id} className={selectedId === x._id ? 'active' : ''} onClick={() => setSelectedId(x._id)}>{x.name}</button>)}
          </div>
        )}

        <div className="list">
          {items.map((item) => (
            <button key={item._id} className={`item text-left ${selectedId === item._id ? 'selected' : ''}`} onClick={() => setSelectedId(item._id)}>
              <strong>{item.title || item.name}</strong>
              {tab === 'notes' && (
                <>
                  {item.publicInfo && <p className="muted">{item.publicInfo}</p>}
                  <p className="muted">
                    {typeof item.decryptedPreview === 'string' ? '🔓 Entschlüsselt' : '🔒 Verschlüsselt'}
                    {getRefName(item.projectId, projects) ? ` · 📁 ${getRefName(item.projectId, projects)}` : ''}
                    {getRefName(item.artistId, artists) ? ` · 🎯 ${getRefName(item.artistId, artists)}` : ''}
                  </p>
                </>
              )}
              {tab !== 'notes' && tab !== 'projects' && tab !== 'artists' && <p className="muted">Status: {item.status || 'open'}</p>}
            </button>
          ))}
        </div>
      </div>

      <div className="editor">
        {!current && <p className="muted">Kein Eintrag vorhanden.</p>}

        {current && tab === 'notes' && (
          <div className="stack">
            <h3>Notiz bearbeiten</h3>
            <button className="meta-toggle" onClick={() => setMetaExpanded((prev) => !prev)}>
              {metaExpanded ? '▾ Details ausblenden' : '▸ Details anzeigen'}
            </button>
            {metaExpanded && (
              <div className="meta-panel">
                <span>📁 {getRefName(draft.projectId, projects) || 'Kein Projekt'}</span>
                <span>🎯 {getRefName(draft.artistId, artists) || 'Keine Strategie'}</span>
                <span>🏷️ {draft.category || 'Keine Kategorie'}</span>
                <span>🔖 {Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || 'Keine Tags')}</span>
              </div>
            )}
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <input value={draft.publicInfo || ''} onChange={(e) => setDraft((d) => ({ ...d, publicInfo: e.target.value }))} />
            <input value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} placeholder="Kategorie" />
            <RefSelect items={projects} value={draft.projectId?._id || draft.projectId || ''} onChange={(projectId) => setDraft((d) => ({ ...d, projectId }))} label="Projekt wählen" />
            <RefSelect items={artists} value={draft.artistId?._id || draft.artistId || ''} onChange={(artistId) => setDraft((d) => ({ ...d, artistId }))} label="Strategie wählen" />
            <input value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="Tags" />
            <select value={draft.status || 'open'} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>{STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}</select>
            <textarea value={typeof draft.decryptedPreview === 'string' ? draft.decryptedPreview : '****'} onChange={(e) => setDraft((d) => ({ ...d, decryptedPreview: e.target.value }))} rows={6} readOnly={typeof draft.decryptedPreview !== 'string'} />
            <div className="row">
              <TeamSelect teams={teams} value={draft.team} onChange={(team) => setDraft((d) => ({ ...d, team, shared: !!team }))} />
              {typeof draft.decryptedPreview === 'string' ? <button onClick={() => setDraft((d) => ({ ...d, decryptedPreview: undefined }))}>🙈</button> : <button onClick={() => onDecrypt(current)}>🔓</button>}
              <button onClick={() => onSaveNote(draft)}>💾</button>
            </div>
          </div>
        )}

        {current && tab === 'tasks' && (
          <div className="stack">
            <h3>Task bearbeiten</h3>
            <button className="meta-toggle" onClick={() => setMetaExpanded((prev) => !prev)}>
              {metaExpanded ? '▾ Details ausblenden' : '▸ Details anzeigen'}
            </button>
            {metaExpanded && (
              <div className="meta-panel">
                <span>📁 {getRefName(draft.projectId, projects) || 'Kein Projekt'}</span>
                <span>🎯 {getRefName(draft.artistId, artists) || 'Keine Strategie'}</span>
                <span>🏷️ {draft.category || 'Keine Kategorie'}</span>
                <span>🔖 {Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || 'Keine Tags')}</span>
              </div>
            )}
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <input value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
            <RefSelect items={projects} value={draft.projectId?._id || draft.projectId || ''} onChange={(projectId) => setDraft((d) => ({ ...d, projectId }))} label="Projekt wählen" />
            <RefSelect items={artists} value={draft.artistId?._id || draft.artistId || ''} onChange={(artistId) => setDraft((d) => ({ ...d, artistId }))} label="Strategie wählen" />
            <input value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="Tags" />
            <select value={draft.status || 'open'} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>{STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select>
            <textarea value={draft.description || ''} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={5} />
            <button onClick={() => onSaveTask(draft)}>💾</button>
          </div>
        )}

        {current && tab === 'todos' && (
          <div className="stack">
            <h3>Todo bearbeiten</h3>
            <button className="meta-toggle" onClick={() => setMetaExpanded((prev) => !prev)}>
              {metaExpanded ? '▾ Details ausblenden' : '▸ Details anzeigen'}
            </button>
            {metaExpanded && (
              <div className="meta-panel">
                <span>📁 {getRefName(draft.projectId, projects) || 'Kein Projekt'}</span>
                <span>🎯 {getRefName(draft.artistId, artists) || 'Keine Strategie'}</span>
                <span>🏷️ {draft.category || 'Keine Kategorie'}</span>
                <span>🔖 {Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || 'Keine Tags')}</span>
              </div>
            )}
            <input value={draft.title || ''} onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))} />
            <input value={draft.category || ''} onChange={(e) => setDraft((d) => ({ ...d, category: e.target.value }))} />
            <RefSelect items={projects} value={draft.projectId?._id || draft.projectId || ''} onChange={(projectId) => setDraft((d) => ({ ...d, projectId }))} label="Projekt wählen" />
            <RefSelect items={artists} value={draft.artistId?._id || draft.artistId || ''} onChange={(artistId) => setDraft((d) => ({ ...d, artistId }))} label="Strategie wählen" />
            <input value={Array.isArray(draft.tags) ? draft.tags.join(', ') : (draft.tags || '')} onChange={(e) => setDraft((d) => ({ ...d, tags: e.target.value }))} placeholder="Tags" />
            <select value={draft.status || 'open'} onChange={(e) => setDraft((d) => ({ ...d, status: e.target.value }))}>{STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}</select>
            <textarea value={draft.details || ''} onChange={(e) => setDraft((d) => ({ ...d, details: e.target.value }))} rows={5} />
            <button onClick={() => onSaveTodo(draft)}>💾</button>
          </div>
        )}

        {current && tab === 'projects' && (
          <div className="stack">
            <h3>Projekt bearbeiten</h3>
            <input value={draft.name || ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <textarea value={draft.description || ''} onChange={(e) => setDraft((d) => ({ ...d, description: e.target.value }))} rows={4} />
            <button onClick={() => onSaveProject(draft)}>💾</button>
          </div>
        )}

        {current && tab === 'artists' && (
          <div className="stack">
            <h3>Strategie bearbeiten</h3>
            <input value={draft.name || ''} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} />
            <textarea value={draft.profile || ''} onChange={(e) => setDraft((d) => ({ ...d, profile: e.target.value }))} rows={4} />
            <button onClick={() => onSaveArtist(draft)}>💾</button>
          </div>
        )}
      </div>
    </section>
  );
}
