import { useEffect, useState } from 'react';
import AuthForm from './components/AuthForm.jsx';
import NotePanel from './components/NotePanel.jsx';
import TaskPanel from './components/TaskPanel.jsx';
import { api, setToken } from './services/api.js';

export default function App() {
  const [user, setUser] = useState(null);
  const [notes, setNotes] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/auth/me')
      .then((res) => setUser(res.data.user))
      .catch(() => setToken(null));
  }, []);

  useEffect(() => {
    if (!user) return;
    Promise.all([api.get('/notes'), api.get('/tasks')]).then(([n, t]) => {
      setNotes(n.data.notes);
      setTasks(t.data.tasks);
    });
  }, [user]);

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
          <p>Browser + Android + iOS (Capacitor) bereit.</p>
        </div>
        <button
          onClick={() => {
            setToken(null);
            setUser(null);
          }}
        >
          Logout
        </button>
      </header>

      <div className="grid">
        <NotePanel
          notes={notes}
          onCreate={async (payload) => {
            const { data } = await api.post('/notes', payload);
            setNotes((prev) => [data.note, ...prev]);
          }}
          onUpdate={async (id, patch) => {
            const { data } = await api.put(`/notes/${id}`, patch);
            setNotes((prev) => prev.map((n) => (n._id === id ? data.note : n)));
          }}
          onDelete={async (id) => {
            await api.delete(`/notes/${id}`);
            setNotes((prev) => prev.filter((n) => n._id !== id));
          }}
        />

        <TaskPanel
          tasks={tasks}
          onCreate={async (payload) => {
            const { data } = await api.post('/tasks', payload);
            setTasks((prev) => [data.task, ...prev]);
          }}
          onUpdate={async (id, patch) => {
            const { data } = await api.put(`/tasks/${id}`, patch);
            setTasks((prev) => prev.map((t) => (t._id === id ? data.task : t)));
          }}
          onDelete={async (id) => {
            await api.delete(`/tasks/${id}`);
            setTasks((prev) => prev.filter((t) => t._id !== id));
          }}
        />
      </div>
    </main>
  );
}
