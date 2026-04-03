// LoginForm.jsx
import React, { useState } from 'react';
import { loginUser, saveUserToStorage } from '../services/authService';

export default function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState(null);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser({ email, password });
      saveUserToStorage(res.customer);
      setErr(null);
      if (onLogin) onLogin(res.customer);
    } catch (e) {
      setErr(e.error || e.message || 'Login failed');
    }
  };

  return (
    <form onSubmit={submit}>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" />
      <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" />
      <button type="submit">Login</button>
      {err && <div style={{color:'red'}}>{String(err)}</div>}
    </form>
  );
}
