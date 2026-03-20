import { useEffect, useMemo, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import NotePanel from './components/NotePanel.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import TeamPanel from './components/TeamPanel.jsx';
import { api, setToken } from './services/api.js';
import { decryptText, encryptText } from './utils/crypto.js';
import { enqueue, flushQueue, queuedCount } from './services/offlineQueue.js';

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
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cryptoPassword, setCryptoPassword] = useState('');
  const [queueCount, setQueueCount] = useState(queuedCount());

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setToken(null));
  }, []);

  async function loadData() {
    const [n, t, teamResult] = await Promise.all([api.get('/notes'), api.get('/tasks'), api.get('/teams')]);
    setNotes(n.data.notes);
    setTasks(t.data.tasks);
    setTeams(teamResult.data.teams);
  }

  useEffect(() => {
    if (!user) return;
    loadData();
  }, [user]);

  useEffect(() => {
    const handler = async () => {
      const synced = await flushQueue(api);
      if (synced > 0) {
        await loadData();
      }
      setQueueCount(queuedCount());
    };
    window.addEventListener('online', handler);
    return () => window.removeEventListener('online', handler);
  }, [user]);

  async function registerPush() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return;

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') return;

    const registration = await navigator.serviceWorker.ready;
    const sub = await registration.pushManager.getSubscription();
    const subscription =
      sub ||
      (await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: import.meta.env.VITE_VAPID_PUBLIC_KEY || undefined
      }));

    await api.post('/push/subscribe', {
      endpoint: subscription.endpoint,
      keys: subscription.toJSON().keys,
      platform: 'web'
    });
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

  const onlineText = useMemo(() => (navigator.onLine ? 'Online' : 'Offline'), []);

  if (!user) {
    return (
      <main className="screen">
        <h1>Atelier Notes</h1>
        {error && <p className="error">{error}</p>}
        <AuthForm
          loading={loading}
          onLogin={(payload) => handleAuth('login', payload)}
          onRegister={(payload) => handleAuth('register', payload)}
        />
      </main>
    );
  }

  return (
    <main className="screen">
      <header className="topbar">
        <div>
          <h1>Willkommen, {user.username}</h1>
          <p>{onlineText} • Offline Queue: {queueCount}</p>
        </div>
        <div className="row">
          <input
            type="password"
            placeholder="E2E Passwort"
            value={cryptoPassword}
            onChange={(e) => setCryptoPassword(e.target.value)}
          />
          <button onClick={registerPush}>Push aktivieren</button>
          <button
            onClick={() => {
              setToken(null);
              setUser(null);
            }}
          >
            Logout
          </button>
        </div>
      </header>

      <div className="grid">
        <NotePanel
          notes={notes}
          teams={teams}
          onCreate={async (payload) => {
            if (!cryptoPassword) return alert('Bitte E2E Passwort setzen');
            const encryptedContent = await encryptText(payload.plainText || '', cryptoPassword);
            const { data } = await apiWithOffline('post', '/notes', {
              title: payload.title,
              shared: payload.shared,
              team: payload.team,
              encryptedContent
            });
            if (data.note) setNotes((prev) => [data.note, ...prev]);
            setQueueCount(queuedCount());
          }}
          onDecrypt={async (note) => {
            if (!cryptoPassword) return alert('Bitte E2E Passwort setzen');
            try {
              const plain = await decryptText(note.encryptedContent, cryptoPassword);
              setNotes((prev) => prev.map((n) => (n._id === note._id ? { ...n, decryptedPreview: plain } : n)));
            } catch {
              alert('Entschlüsselung fehlgeschlagen');
            }
          }}
          onAttach={async (id, file) => {
            const { data } = await apiWithOffline('post', `/notes/${id}/attachments`, file);
            if (data.note) setNotes((prev) => prev.map((n) => (n._id === id ? data.note : n)));
            setQueueCount(queuedCount());
          }}
          onUpdate={async (id, patch) => {
            const { data } = await apiWithOffline('put', `/notes/${id}`, patch);
            if (data.note) setNotes((prev) => prev.map((n) => (n._id === id ? data.note : n)));
            setQueueCount(queuedCount());
          }}
          onDelete={async (id) => {
            await apiWithOffline('delete', `/notes/${id}`);
            setNotes((prev) => prev.filter((n) => n._id !== id));
            setQueueCount(queuedCount());
          }}
        />

        <TaskPanel
          tasks={tasks}
          onCreate={async (payload) => {
            const { data } = await apiWithOffline('post', '/tasks', payload);
            if (data.task) setTasks((prev) => [data.task, ...prev]);
            setQueueCount(queuedCount());
          }}
          onUpdate={async (id, patch) => {
            const { data } = await apiWithOffline('put', `/tasks/${id}`, patch);
            if (data.task) setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
            setQueueCount(queuedCount());
          }}
          onDelete={async (id) => {
            await apiWithOffline('delete', `/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t._id !== id));
            setQueueCount(queuedCount());
          }}
        />

        <TeamPanel
          teams={teams}
          onCreateTeam={async (name) => {
            const { data } = await api.post('/teams', { name });
            setTeams((prev) => [data.team, ...prev]);
          }}
          onInvite={async (teamId, email, role) => {
            const { data } = await api.post(`/teams/${teamId}/members`, { email, role });
            setTeams((prev) => prev.map((t) => (t._id === teamId ? data.team : t)));
          }}
        />
      </div>
    </main>
  );
}
