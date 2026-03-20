import { useState } from 'react';

export default function AuthForm({ onLogin, onRegister, loading }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const submit = (e) => {
    e.preventDefault();
    if (mode === 'login') {
      onLogin({ email: form.email, password: form.password });
    } else {
      onRegister(form);
    }
  };

  return (
    <form className="card" onSubmit={submit}>
      <h2>{mode === 'login' ? 'Anmelden' : 'Registrieren'}</h2>
      {mode === 'register' && (
        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
          required
        />
      )}
      <input
        type="email"
        placeholder="E-Mail"
        value={form.email}
        onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
        required
      />
      <input
        type="password"
        placeholder="Passwort"
        value={form.password}
        onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
        required
      />
      <button disabled={loading}>{loading ? 'Bitte warten…' : mode === 'login' ? 'Login' : 'Account erstellen'}</button>
      <p>
        {mode === 'login' ? 'Noch kein Konto?' : 'Schon ein Konto?'}{' '}
        <button type="button" className="link" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
          {mode === 'login' ? 'Registrieren' : 'Anmelden'}
        </button>
      </p>
    </form>
  );
}
