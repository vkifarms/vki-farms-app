import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { T, VARIANTS, n, fc, tod } from '../lib/constants';
import { Btn, Card, Field, Chip, StatBox, TabBar, Spinner, Alert } from '../components/UI';

function Dashboard() {
  const [sessions, setSessions] = useState([]);
  const [allSales, setAllSales] = useState([]);
  const [loading, setLoading]   = useState(true);

  const fetchLive = useCallback(async () => {
    const today = tod();
    const { data: sess } = await supabase
      .from('sessions')
      .select('*, rep:rep_id(full_name, username), sales(*)')
      .eq('date', today)
      .order('opened_at', { ascending: false });
    setSessions(sess || []);
    setAllSales((sess || []).flatMap(s => s.sales || []));
    setLoading(false);
  }, []);

  useEffect(() => { fetchLive(); const t = setInterval(fetchLive, 15000); return () => clearInterval(t); }, [fetchLive]);

  if (loading) return <Spinner />;

  const totalRev   = allSales.reduce((s, x) => s + x.total, 0);
  const totalKg    = allSales.reduce((s, x) => s + x.kg, 0);
  const activeSess = sessions.filter(s => !s.closed_at);

  return (
    <div>
      <div style={{ fontSize: 9, letterSpacing: 2, color: T.dim, textTransform: 'uppercase', marginBottom: 10 }}>
        Live · Today {tod()} · Auto-refreshes every 15s
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
        <StatBox label="Today's Revenue" value={fc(totalRev)}             color={T.gold}  />
        <StatBox label="Total KG Sold"   value={totalKg.toFixed(1)+'kg'}  color={T.green} />
        <StatBox label="Active Markets"  value={activeSess.length}        color={T.amber} />
        <StatBox label="Total Sales"     value={allSales.length}          color={T.goldL} />
      </div>
      {sessions.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: T.dim, fontSize: 12 }}>No market activity today.</div>
      )}
      {sessions.map(sess => {
        const sales = sess.sales || [];
        const rev   = sales.reduce((s, x) => s + x.total, 0);
        const kg    = sales.reduce((s, x) => s + x.kg, 0);
        return (
          <Card key={sess.id} title={sess.market_name} icon={sess.closed_at ? '🔴' : '🟢'} subtitle={sess.rep?.full_name || sess.rep?.username}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
              <StatBox label="Sales"   value={sales.length}  color={T.gold}  />
              <StatBox label="Revenue" value={fc(rev)}       color={T.green} />
              <StatBox label="KG"      value={kg.toFixed(1)} color={T.goldL} />
            </div>
            <div style={{ fontSize: 10, color: T.dim }}>
              {sess.closed_at ? `Closed ${new Date(sess.closed_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : `Open since ${new Date(sess.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`}
            </div>
            {sales.slice(-3).reverse().map(sale => (
              <div key={sale.id} style={{ padding: '7px 0', borderTop: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', fontSize: 11, marginTop: 8 }}>
                <span style={{ color: T.mid }}>{sale.kg}kg {sale.variant} · {sale.pay_mode}</span>
                <span style={{ color: T.gold, fontWeight: 700 }}>{fc(sale.total)}</span>
              </div>
            ))}
          </Card>
        );
      })}
    </div>
  );
}

function Reports() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [dateFrom, setDateFrom] = useState(tod());
  const [dateTo, setDateTo]     = useState(tod());

  const fetchReports = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('sessions')
      .select('*, rep:rep_id(full_name, username), sales(*)')
      .gte('date', dateFrom)
      .lte('date', dateTo)
      .order('date', { ascending: false });
    setSessions(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchReports(); }, []);

  const allSales = sessions.flatMap(s => s.sales || []);
  const totalRev = allSales.reduce((s, x) => s + x.total, 0);
  const totalKg  = allSales.reduce((s, x) => s + x.kg, 0);

  return (
    <div>
      <Card title="Date Range" icon="📅">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 12px' }}>
          <Field label="From" value={dateFrom} onChange={setDateFrom} type="date" />
          <Field label="To"   value={dateTo}   onChange={setDateTo}   type="date" />
        </div>
        <Btn onClick={fetchReports} full size="sm">Apply Filter</Btn>
      </Card>
      {!loading && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
            <StatBox label="Total Revenue" value={fc(totalRev)}             color={T.gold}  />
            <StatBox label="Total KG"      value={totalKg.toFixed(1)+'kg'}  color={T.green} />
            <StatBox label="Sessions"      value={sessions.length}          color={T.goldL} />
            <StatBox label="Total Sales"   value={allSales.length}          color={T.amber} />
          </div>
          <Card title="By Variant" icon="📊">
            {VARIANTS.map(v => {
              const vSales = allSales.filter(x => x.variant === v.key);
              const vRev   = vSales.reduce((s, x) => s + x.total, 0);
              const vKg    = vSales.reduce((s, x) => s + x.kg, 0);
              return (
                <div key={v.key} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Chip label={v.label} color={v.color} bg={v.bg} border={v.border} />
                  <span style={{ fontSize: 11, color: T.mid }}>{vKg.toFixed(1)}kg</span>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 16, color: v.color }}>{fc(vRev)}</span>
                </div>
              );
            })}
          </Card>
          <Card title="By Rep" icon="👤">
            {sessions.reduce((reps, sess) => {
              const key = sess.rep?.username;
              if (!key || reps.find(r => r.username === key)) return reps;
              return [...reps, sess.rep];
            }, []).map(rep => {
              const repSess = sessions.filter(s => s.rep?.username === rep.username);
              const repRev  = repSess.flatMap(s => s.sales || []).reduce((s, x) => s + x.total, 0);
              const repKg   = repSess.flatMap(s => s.sales || []).reduce((s, x) => s + x.kg, 0);
              return (
                <div key={rep.username} style={{ padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, color: '#fff', fontSize: 12 }}>{rep.full_name || rep.username}</div>
                    <div style={{ fontSize: 10, color: T.dim }}>{repSess.length} sessions · {repKg.toFixed(1)}kg</div>
                  </div>
                  <span style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 18, color: T.gold }}>{fc(repRev)}</span>
                </div>
              );
            })}
          </Card>
        </>
      )}
      {loading && <Spinner />}
    </div>
  );
}

function RepsManager() {
  const [reps, setReps]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ username: '', password_hash: '', full_name: '', phone: '' });
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState('');

  const fetchReps = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('role', 'rep').order('created_at', { ascending: false });
    setReps(data || []); setLoading(false);
  };

  useEffect(() => { fetchReps(); }, []);

  const createRep = async () => {
    setError(''); setSuccess('');
    if (!form.username.trim() || !form.password_hash.trim()) { setError('Username and password are required.'); return; }
    const { error: err } = await supabase.from('profiles').insert({ ...form, username: form.username.toLowerCase().trim(), role: 'rep' });
    if (err) { setError(err.message.includes('unique') ? 'Username already exists.' : err.message); return; }
    setSuccess(`Rep "${form.username}" created successfully!`);
    setForm({ username: '', password_hash: '', full_name: '', phone: '' });
    setCreating(false); fetchReps();
  };

  const toggleActive = async (rep) => {
    await supabase.from('profiles').update({ is_active: !rep.is_active }).eq('id', rep.id);
    fetchReps();
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <Alert msg={success} type="success" />
      <Alert msg={error}   type="error"   />
      {creating ? (
        <Card title="Create New Rep" icon="➕">
          <Field label="Full Name" value={form.full_name}     onChange={v => setForm(f => ({ ...f, full_name: v }))}     placeholder="e.g. Chukwudi Obi" />
          <Field label="Username"  value={form.username}      onChange={v => setForm(f => ({ ...f, username: v }))}      placeholder="e.g. chukwudi" />
          <Field label="Password"  value={form.password_hash} onChange={v => setForm(f => ({ ...f, password_hash: v }))} placeholder="Set a password" />
          <Field label="Phone"     value={form.phone}         onChange={v => setForm(f => ({ ...f, phone: v }))}         placeholder="e.g. 08012345678" />
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            <Btn onClick={createRep} size="sm">Create Rep</Btn>
            <Btn onClick={() => setCreating(false)} variant="ghost" size="sm">Cancel</Btn>
          </div>
        </Card>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <Btn onClick={() => setCreating(true)} full size="lg">+ Create New Rep</Btn>
        </div>
      )}
      <div style={{ fontSize: 9, letterSpacing: 2, color: T.dim, textTransform: 'uppercase', marginBottom: 10 }}>
        {reps.length} Rep{reps.length !== 1 ? 's' : ''}
      </div>
      {reps.map(rep => (
        <Card key={rep.id} title={rep.full_name || rep.username} icon="👤">
          <div style={{ fontSize: 11, color: T.dim, marginBottom: 10 }}>
            <div>Username: <strong style={{ color: '#fff' }}>@{rep.username}</strong></div>
            {rep.phone && <div>Phone: <strong style={{ color: '#fff' }}>{rep.phone}</strong></div>}
            <div style={{ marginTop: 4 }}>
              <span style={{ padding: '2px 8px', borderRadius: 4, fontSize: 9, fontWeight: 900, background: rep.is_active ? 'rgba(93,187,122,0.15)' : 'rgba(224,85,85,0.15)', color: rep.is_active ? T.green : T.red, border: `1px solid ${rep.is_active ? 'rgba(93,187,122,0.3)' : 'rgba(224,85,85,0.3)'}` }}>
                {rep.is_active ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
          </div>
          <Btn onClick={() => toggleActive(rep)} variant={rep.is_active ? 'danger' : 'green'} size="sm">
            {rep.is_active ? 'Deactivate' : 'Reactivate'}
          </Btn>
        </Card>
      ))}
    </div>
  );
}

function PricingManager() {
  const [form, setForm]       = useState({});
  const [saved, setSaved]     = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('pricing').select('*');
      if (data) {
        const p = {};
        data.forEach(row => { p[`${row.variant}_market`] = row.market_rate; p[`${row.variant}_mine`] = row.selling_price; p[`${row.variant}_buy`] = row.buy_price; });
        setForm(p);
      }
      setLoading(false);
    })();
  }, []);

  const saveAll = async () => {
    for (const v of VARIANTS) {
      await supabase.from('pricing').update({ market_rate: n(form[`${v.key}_market`]), selling_price: n(form[`${v.key}_mine`]), buy_price: n(form[`${v.key}_buy`]), updated_at: new Date().toISOString() }).eq('variant', v.key);
    }
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div style={{ padding: '10px 14px', background: 'rgba(93,187,122,0.08)', border: '1px solid rgba(93,187,122,0.2)', borderRadius: 7, fontSize: 11, color: T.mid, marginBottom: 14 }}>
        ✅ Prices saved here are <strong style={{ color: '#fff' }}>automatically pushed to all reps</strong> on their next refresh.
      </div>
      {VARIANTS.map(v => {
        const market = n(form[`${v.key}_market`]), mine = n(form[`${v.key}_mine`]), buy = n(form[`${v.key}_buy`]);
        const margin   = mine && buy ? Math.round(((mine - buy) / buy) * 100) : null;
        const discount = market && mine ? Math.round(((market - mine) / market) * 100) : null;
        return (
          <Card key={v.key} title={v.label} icon={v.emoji}>
            <Field label="Market Rate" value={form[`${v.key}_market`] || ''} onChange={val => setForm(f => ({ ...f, [`${v.key}_market`]: val }))} type="number" prefix="₦" />
            <Field label="Your Price"  value={form[`${v.key}_mine`] || ''}   onChange={val => setForm(f => ({ ...f, [`${v.key}_mine`]: val }))}   type="number" prefix="₦" />
            <Field label="Buy Price"   value={form[`${v.key}_buy`] || ''}    onChange={val => setForm(f => ({ ...f, [`${v.key}_buy`]: val }))}    type="number" prefix="₦" />
            {(margin !== null || discount !== null) && (
              <div style={{ display: 'flex', gap: 12, marginTop: 2 }}>
                {margin   !== null && <span style={{ fontSize: 11, color: margin > 0 ? T.green : T.red, fontWeight: 700 }}>Margin: {margin}%</span>}
                {discount !== null && <span style={{ fontSize: 11, color: discount > 0 ? T.amber : T.dim, fontWeight: 700 }}>{discount > 0 ? `${discount}% below market` : `${Math.abs(discount)}% above market`}</span>}
              </div>
            )}
          </Card>
        );
      })}
      <Btn onClick={saveAll} full size="lg">{saved ? '✓ Saved & Pushed!' : 'Save & Push to All Reps'}</Btn>
    </div>
  );
}

function Messaging({ admin }) {
  const [reps, setReps]               = useState([]);
  const [selectedRep, setSelectedRep] = useState(null);
  const [messages, setMessages]       = useState([]);
  const [msg, setMsg]                 = useState('');
  const [sending, setSending]         = useState(false);

  useEffect(() => {
    supabase.from('profiles').select('*').eq('role', 'rep').eq('is_active', true).then(({ data }) => setReps(data || []));
  }, []);

  const loadMessages = useCallback(async (rep) => {
    const { data } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${admin.id},receiver_id.eq.${rep.id}),and(sender_id.eq.${rep.id},receiver_id.eq.${admin.id})`)
      .order('created_at', { ascending: true });
    setMessages(data || []);
  }, [admin.id]);

  useEffect(() => {
    if (!selectedRep) return;
    loadMessages(selectedRep);
    const t = setInterval(() => loadMessages(selectedRep), 10000);
    return () => clearInterval(t);
  }, [selectedRep, loadMessages]);

  const sendMsg = async () => {
    if (!msg.trim() || !selectedRep) return;
    setSending(true);
    await supabase.from('messages').insert({ sender_id: admin.id, receiver_id: selectedRep.id, body: msg.trim() });
    setMsg(''); await loadMessages(selectedRep); setSending(false);
  };

  const broadcast = async () => {
    if (!msg.trim()) return;
    setSending(true);
    for (const rep of reps) {
      await supabase.from('messages').insert({ sender_id: admin.id, receiver_id: rep.id, body: msg.trim() });
    }
    setMsg(''); setSending(false);
    alert(`Message sent to all ${reps.length} reps.`);
  };

  return (
    <div>
      <Card title="Select Rep" icon="👤">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {reps.map(rep => (
            <button key={rep.id} onClick={() => setSelectedRep(rep)} style={{ padding: '12px 14px', borderRadius: 8, border: `1px solid ${selectedRep?.id === rep.id ? T.gold : T.border}`, background: selectedRep?.id === rep.id ? 'rgba(201,168,76,0.12)' : 'rgba(255,255,255,0.03)', color: '#fff', textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit' }}>
              <div style={{ fontWeight: 700, fontSize: 13 }}>{rep.full_name || rep.username}</div>
              <div style={{ fontSize: 10, color: T.dim }}>@{rep.username}</div>
            </button>
          ))}
        </div>
      </Card>
      {selectedRep && (
        <>
          <Card title={`Chat with ${selectedRep.full_name || selectedRep.username}`} icon="💬" noPad>
            <div style={{ maxHeight: 300, overflowY: 'auto', padding: '8px 0' }}>
              {messages.length === 0 && <div style={{ padding: 16, fontSize: 12, color: T.dim }}>No messages yet.</div>}
              {messages.map(m => {
                const isMe = m.sender_id === admin.id;
                return (
                  <div key={m.id} style={{ padding: '8px 16px', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                    <div style={{ maxWidth: '80%', padding: '10px 14px', borderRadius: isMe ? '12px 12px 2px 12px' : '12px 12px 12px 2px', background: isMe ? 'rgba(201,168,76,0.15)' : 'rgba(255,255,255,0.06)', border: `1px solid ${isMe ? 'rgba(201,168,76,0.25)' : T.border}` }}>
                      <div style={{ fontSize: 12, color: '#fff', lineHeight: 1.5 }}>{m.body}</div>
                    </div>
                    <div style={{ fontSize: 9, color: T.dim, marginTop: 3 }}>{isMe ? 'You' : selectedRep.full_name} · {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                );
              })}
            </div>
          </Card>
          <Card title="Send Message" icon="✏️">
            <Field value={msg} onChange={setMsg} placeholder="Type your message..." />
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn onClick={sendMsg} disabled={sending || !msg.trim()} size="sm">{sending ? 'Sending...' : 'Send'}</Btn>
              <Btn onClick={broadcast} variant="outline" disabled={sending || !msg.trim()} size="sm">📢 Broadcast All</Btn>
            </div>
          </Card>
        </>
      )}
    </div>
  );
}

export default function MasterPortal({ admin, onLogout }) {
  const [tab, setTab] = useState('dashboard');

  const tabs = [
    { key: 'dashboard', label: '📡 Live'    },
    { key: 'reports',   label: '📊 Reports' },
    { key: 'reps',      label: '👥 Reps'    },
    { key: 'pricing',   label: '🏷️ Prices'  },
    { key: 'messages',  label: '📨 Msgs'    },
  ];

  return (
    <div style={{ minHeight: '100vh', background: T.dark, overflowX: 'hidden' }}>
      <div style={{ background: T.navy, padding: '14px 16px 12px', borderBottom: `1px solid ${T.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 20, letterSpacing: 4, color: '#fff', lineHeight: 1 }}>VKI Farms</div>
          <div style={{ fontSize: 8, letterSpacing: 2, color: T.gold, marginTop: 3, textTransform: 'uppercase' }}>Master Portal · {admin.full_name || 'Admin'}</div>
        </div>
        <button onClick={onLogout} style={{ background: 'none', border: `1px solid ${T.border}`, borderRadius: 6, color: T.dim, fontSize: 10, padding: '5px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>Logout</button>
      </div>
      <TabBar tabs={tabs} active={tab} onChange={setTab} />
      <div style={{ padding: '18px 14px 70px', maxWidth: 520, margin: '0 auto' }}>
        {tab === 'dashboard' && <Dashboard />}
        {tab === 'reports'   && <Reports />}
        {tab === 'reps'      && <RepsManager />}
        {tab === 'pricing'   && <PricingManager />}
        {tab === 'messages'  && <Messaging admin={admin} />}
      </div>
    </div>
  );
}
