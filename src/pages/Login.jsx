import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { T } from '../lib/constants';
import { Btn, Field, Alert } from '../components/UI';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) { setError('Enter username and password.'); return; }
    setLoading(true); setError('');
    try {
      const { data, error: err } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username.trim().toLowerCase())
        .eq('password_hash', password.trim())
        .eq('is_active', true)
        .single();
      if (err || !data) { setError('Invalid username or password.'); setLoading(false); return; }
      onLogin(data);
    } catch (e) {
      setError('Connection error. Check your internet.');
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: T.dark, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      <div style={{ width: '100%', maxWidth: 380 }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 42, letterSpacing: 6, color: '#fff', lineHeight: 1 }}>VKI Farms</div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: T.gold, marginTop: 6, textTransform: 'uppercase' }}>Market Operations Platform</div>
          <div style={{ width: 40, height: 2, background: T.gold, margin: '12px auto 0' }} />
        </div>
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 24 }}>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, letterSpacing: 3, color: T.gold, marginBottom: 20 }}>Sign In</div>
          <Alert msg={error} type="error" />
          <Field label="Username" value={username} onChange={setUsername} placeholder="Enter username" />
          <Field label="Password" value={password} onChange={v => setPassword(v)} type="password" placeholder="Enter password" />
          <div style={{ marginTop: 8 }}>
            <Btn onClick={handleLogin} full size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </Btn>
          </div>
        </div>
        <div style={{ textAlign: 'center', marginTop: 24, fontSize: 10, color: T.dim, letterSpacing: 1 }}>
          VKI FARMS · BENIN CITY · FIELD OPERATIONS
        </div>
      </div>
    </div>
  );
}
