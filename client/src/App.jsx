import { useEffect, useMemo, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import AppHeader from './components/AppHeader.jsx';
import WorkspacePage from './components/WorkspacePage.jsx';
import TeamPage from './components/TeamPage.jsx';
import ProfilePage from './components/ProfilePage.jsx';
import CreateModal from './components/CreateModal.jsx';
import { api, setToken } from './services/api.js';
import { decryptText, encryptText } from './utils/crypto.js';
import { enqueue, flushQueue, queuedCount } from './services/offlineQueue.js';

function emptyForm() {
  return { title: '', publicInfo: '', body: '', team: '', file: null };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || '').split(',')[1]);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function apiWithOffline(method, url, data) {
  try {
    return await api({ method, url, data });
  } catch (err) {
    if (!navigator.onLine || err.code === 'ERR_NETWORK') {
      enqueue({ method, url, data });
      return { data: { offlineQueued: true } };
    }
    throw err;
  }
}

export default function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [todos, setTodos] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cryptoPassword, setCryptoPassword] = useState(localStorage.getItem('atelier_crypto_pw') || '');
  const [rememberCrypto, setRememberCrypto] = useState(localStorage.getItem('atelier_crypto_remember') === '1');
  const [queueCount, setQueueCount] = useState(queuedCount());
  const [page, setPage] = useState('workspace');
  const [tab, setTab] = useState('notes');
  const [createOpen, setCreateOpen] = useState(false);
  const [createMode, setCreateMode] = useState('note');
  const [form, setForm] = useState(emptyForm());

  function upsertTeam(team) {
    setTeams((prev) => {
      const filtered = prev.filter((t) => t._id !== team._id);
      return [team, ...filtered];
    });
  }

  useEffect(() => {
    api.get('/auth/me').then((res) => setUser(res.data.user)).catch(() => setToken(null));
  }, []);

  async function loadData() {
    const [n, t, td, teamResult] = await Promise.all([api.get('/notes'), api.get('/tasks'), api.get('/todos'), api.get('/teams')]);
    setNotes(n.data.notes);
    setTasks(t.data.tasks);
    setTodos(td.data.todos);
    setTeams(teamResult.data.teams);
  }

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    const handler = async () => {
      const synced = await flushQueue(api);
      if (synced > 0) await loadData();
      setQueueCount(queuedCount());
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [user]);


  useEffect(() => {
    if (!cryptoPassword || !notes.length) return;
    Promise.all(
      notes.map(async (n) => {
        try {
          const plain = await decryptText(n.encryptedContent, cryptoPassword);
          return { ...n, decryptedPreview: plain };
        } catch {
          return n;
        }
      })
    ).then((resolved) => setNotes(resolved));
  }, [cryptoPassword, notes.length]);


  useEffect(() => {
    if (rememberCrypto && cryptoPassword) {
      localStorage.setItem('atelier_crypto_pw', cryptoPassword);
      localStorage.setItem('atelier_crypto_remember', '1');
    } else {
      localStorage.removeItem('atelier_crypto_pw');
      localStorage.setItem('atelier_crypto_remember', rememberCrypto ? '1' : '0');
    }
  }, [rememberCrypto, cryptoPassword]);

  async function registerPush() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;
    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    const subscription = sub || (await registration.pushManager.subscribe({ userVisibleOnly: true }));
    await api.post('/push/subscribe', { endpoint: subscription.endpoint, keys: subscription.toJSON().keys, platform: 'web' });
  }

  async function handleAuth(endpoint, payload) {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.post(`/auth/${endpoint}`, payload);
      setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Login fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  }

  async function encryptGroupPassword(groupPassword, recipientHint) {
    if (!groupPassword) return '';
    const keyBasis = cryptoPassword || recipientHint;
    if (!keyBasis) return '';
    const encrypted = await encryptText(groupPassword, keyBasis);
    return JSON.stringify(encrypted);
  }

  async function submitCreate() {
    if (!form.title.trim()) return;

    if (createMode === 'note') {
      if (!cryptoPassword) {
        alert('Bitte E2E Passwort setzen. Deine Eingaben bleiben erhalten.');
        return;
      }
      const encryptedContent = await encryptText(form.body || '', cryptoPassword);
      const { data } = await apiWithOffline('post', '/notes', {
        title: form.title,
        publicInfo: form.publicInfo,
        shared: !!form.team,
        team: form.team || null,
        encryptedContent
      });
      if (data.note) {
        if (form.file) {
          const dataBase64 = await fileToBase64(form.file);
          const upload = await apiWithOffline('post', `/notes/${data.note._id}/attachments`, {
            name: form.file.name,
            mimeType: form.file.type || 'application/octet-stream',
            size: form.file.size,
            dataBase64
          });
          if (upload.data.note) data.note = upload.data.note;
        }
        setNotes((prev) => [data.note, ...prev]);
      }
    }

    if (createMode === 'task') {
      const { data } = await apiWithOffline('post', '/tasks', {
        title: form.title,
        description: form.body,
        team: form.team || null
      });
      if (data.task) setTasks((prev) => [data.task, ...prev]);
    }

    if (createMode === 'todo') {
      const { data } = await apiWithOffline('post', '/todos', {
        title: form.title,
        details: form.body,
        team: form.team || null
      });
      if (data.todo) setTodos((prev) => [data.todo, ...prev]);
    }

    setQueueCount(queuedCount());
    setForm(emptyForm());
    setCreateOpen(false);
  }

  const onlineText = useMemo(() => (navigator.onLine ? 'Online' : 'Offline'), []);

  if (!user) {
    return (
      <main className="screen">
        <h1>Atelier Notes</h1>
        <p className="muted">{onlineText}</p>
        {error && <p className="error">{error}</p>}
        <AuthForm loading={loading} onLogin={(payload) => handleAuth('login', payload)} onRegister={(payload) => handleAuth('register', payload)} />
      </main>
    );
  }

  return (
    <main className="screen">
      <AppHeader page={page} setPage={setPage} onOpenCreate={() => setCreateOpen(true)} queueCount={queueCount} user={user} cryptoPassword={cryptoPassword} setCryptoPassword={setCryptoPassword} rememberCrypto={rememberCrypto} setRememberCrypto={setRememberCrypto} />

      {page === 'workspace' && (
        <WorkspacePage
          tab={tab}
          setTab={setTab}
          notes={notes}
          tasks={tasks}
          todos={todos}
          teams={teams}
          onDecrypt={async (note) => {
            if (!cryptoPassword) return alert('Bitte E2E Passwort setzen');
            const plain = await decryptText(note.encryptedContent, cryptoPassword).catch(() => null);
            if (!plain && plain !== '') return alert('Entschlüsselung fehlgeschlagen');
            setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, decryptedPreview: plain } : n)));
          }}
          onSaveNote={async (draft) => {
            if (!cryptoPassword) return alert('E2E Passwort fehlt');
            const encryptedContent = await encryptText(draft.decryptedPreview || '', cryptoPassword);
            const { data } = await apiWithOffline('put', `/notes/${draft._id}`, {
              title: draft.title,
              publicInfo: draft.publicInfo || '',
              team: draft.team || null,
              shared: !!draft.team,
              encryptedContent
            });
            if (data.note) setNotes((prev) => prev.map((n) => (n._id === draft._id ? data.note : n)));
          }}
          onSaveTask={async (draft) => {
            const { data } = await apiWithOffline('put', `/tasks/${draft._id}`, draft);
            if (data.task) setTasks((prev) => prev.map((n) => (n._id === draft._id ? data.task : n)));
          }}
          onSaveTodo={async (draft) => {
            const { data } = await apiWithOffline('put', `/todos/${draft._id}`, draft);
            if (data.todo) setTodos((prev) => prev.map((n) => (n._id === draft._id ? data.todo : n)));
          }}
        />
      )}

      {page === 'teams' && (
        <TeamPage
          teams={teams}
          onCreateTeam={async (name, groupPassword) => {
            const ownerEncryptedTeamPassword = await encryptGroupPassword(groupPassword, user.email);
            const { data } = await api.post('/teams', {
              name,
              security: groupPassword ? { enabled: true, ownerEncryptedTeamPassword, memberEncryptedKeys: [] } : undefined
            });
            upsertTeam(data.team)
          }}
          onSaveTeam={async (teamId, name) => {
            const { data } = await api.put(`/teams/${teamId}`, { name });
            upsertTeam(data.team)
          }}
          onSetSecurity={async (teamId, groupPassword) => {
            const ownerEncryptedTeamPassword = await encryptGroupPassword(groupPassword, user.email);
            const { data } = await api.post(`/teams/${teamId}/security`, {
              enabled: !!groupPassword,
              ownerEncryptedTeamPassword
            });
            upsertTeam(data.team)
          }}
          onInvite={async (teamId, email, role, groupPassword) => {
            const encryptedGroupKey = await encryptGroupPassword(groupPassword, email.toLowerCase());
            const { data } = await api.post(`/teams/${teamId}/members`, { email, role, encryptedGroupKey });
            upsertTeam(data.team)
          }}
        />
      )}

      {page === 'profile' && (
        <ProfilePage
          user={user}
          cryptoPassword={cryptoPassword}
          setCryptoPassword={setCryptoPassword}
          onEnablePush={registerPush}
          onLogout={() => {
            setToken(null);
            setUser(null);
          }}
        />
      )}

      <CreateModal
        open={createOpen}
        mode={createMode}
        setMode={setCreateMode}
        form={form}
        setForm={setForm}
        teams={teams}
        onClose={() => setCreateOpen(false)}
        onSubmit={submitCreate}
      />
    </main>
  );
}
