import { useState, useEffect } from 'react';
import Login from './pages/Login';
import MasterPortal from './pages/MasterPortal';
import RepPortal from './pages/RepPortal';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('vki_user');
    if (stored) { try { setUser(JSON.parse(stored)); } catch { localStorage.removeItem('vki_user'); } }
  }, []);

  const handleLogin = (userData) => {
    localStorage.setItem('vki_user', JSON.stringify(userData));
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('vki_user');
    setUser(null);
  };

  if (!user) return <Login onLogin={handleLogin} />;
  if (user.role === 'admin') return <MasterPortal admin={user} onLogout={handleLogout} />;
  return <RepPortal rep={user} onLogout={handleLogout} />;
}
